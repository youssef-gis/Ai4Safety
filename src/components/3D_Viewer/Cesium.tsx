'use client'
import type { Entity, Cartesian3, Color } from "cesium";

import React, { useEffect, useRef, useState } from 'react';
// import { 
//     CustomDataSource,
//     Entity,
//     Viewer,
//     Cesium3DTileset,
//     Scene,
//     Cartesian3
// } from 'cesium';

import { CesiumType } from './types/cesium';
import { basemapsLayers } from './imagery_basemaps';
import { autoAlignTileset } from './auto-align-tileset';
import { Button } from '../ui/button';
import { Pencil, Square, Trash2, Hand, LucideFullscreen, X, TriangleAlert } from 'lucide-react';
import { DefectCandidate, useDrawingManager } from './hooks/use-drawing-manager';
import { CesiumComponentProps } from './CesiumWrapper';
import { LayerControl, SeverityVisibility } from './components/layer-control';
import { DefectSearch } from './components/defect-search';
import { getOrientationFromRodrigues} from './get-Orientation-From-Rodrigues';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import Image from 'next/image';
import { ImageViewerModal } from '../image-viewer-modal';
import { getCameraPositionECEF, getRayFromPixel, intersectRayWithTileset, rodriguesToMatrix, snapPointToTileset } from './get-Ray-From-Pixel';
import { debugCameraProjection } from './debug-projection';
import { intersectRayWithPlane, setCesiumCameraToDrone } from './utils/intersection-utils';
import { findBestCamera, getSurfaceNormal } from './utils/camera-math';
//import "@cesium/widgets/styles.css";

const triangleAlertSvg = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
`)}`;

// Helper to extract Camera Context from the Cesium Entity
const getCameraContext = (entity: InstanceType<typeof CesiumJs.Entity> | null, CesiumJs: CesiumType) => {
    if (!entity) return undefined;
    
    // Get time-based values
    const time = CesiumJs.JulianDate.now();
    const position = entity.position?.getValue(time);
    const orientation = entity.orientation?.getValue(time);
    
    // Get custom properties we stored earlier
    // Note: In your code, you stored intrinsics in 'cameraData' property
    const camData = entity.properties?.getValue(time)?.cameraData;

    if (!position || !orientation || !camData) return undefined;

    return {
        position: { x: position.x, y: position.y, z: position.z },
        orientation: { x: orientation.x, y: orientation.y, z: orientation.z, w: orientation.w },
        intrinsics: {
            width: camData.width,
            height: camData.height,
            focal: camData.focal 
        }
    };
};

const getSeverityColor = (CesiumJs: CesiumType, severity: string) => {
    switch (severity) {
        case 'CRITICAL':
            return CesiumJs.Color.RED;
        case 'HIGH':
            return CesiumJs.Color.ORANGE;
        case 'MEDIUM':
            return CesiumJs.Color.YELLOW;
        case 'LOW':
            return CesiumJs.Color.LIME; // or CYAN
        default:
            return CesiumJs.Color.WHITE; // Fallback
    }
};

export const CesiumComponent: React.FunctionComponent<CesiumComponentProps> = ({
    CesiumJs,
    cesiumContainerRef,
    onFullscreenToggle,
    isMapFullscreen,
    proxyBaseUrl,
    camerasUrl,  
    tilesetUrl, 
    initialDetections,
    onDefectDetected,
    onDefectSelected, 
    focusedDefectId,
    showTileset,
    
    onToggleTileset,
    severityVisibility,
    onToggleSeverity,
    onToggleAllDefects,
    defectToEditImage,
    onCloseImageEdit
    
}) => {
    
    // Fix global variable assignment
    // if (typeof window !== 'undefined') {
    //     (window as any).CESIUM_BASE_URL = '/cesium';
    // };

    // useEffect(() => {
    //     (window as any).CESIUM_BASE_URL = '/cesium';
    // }, [])

    const cesiumViewer = useRef<any | null>(null);
    const defectsDataSourceRef = useRef<any | null>(null);
    const camerasDataSourceRef = useRef<any | null>(null);
    
    const addedScenePrimitives = useRef<any[]>([]);
    const currentTilesetRef = useRef<any | null>(null);
    const isLoaded = useRef(false);
    const [viewerReady, setViewerReady] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const selectedCameraEntity = useRef<any | null>(null);
    const localToWorldTransformRef = useRef<any>(null);
    const [temp3DLocation, setTemp3DLocation] = useState<any | null>(null);


    const { 
        drawingMode, 
        startDrawing,
        stopDrawing, 
        clearActiveDrawing 
    } = useDrawingManager({
        CesiumJs,
        viewerRef: cesiumViewer,
        onShapeCreated: (candidate, entities) => {
            if (onDefectDetected) {
                onDefectDetected(candidate, entities);
            }
        }
    });

    const parseCameraModel = (cameraString: string) => {
        // Example: "v2 dji fc330 4000 3000 brown 0.5555"
        const parts = cameraString.split(' ');
        
        return {
            version: parts[0],
            make: parts[1],
            model: parts[2],
            width: parseInt(parts[3]) || 4000,
            height: parseInt(parts[4]) || 3000,
            distortionModel: parts[5] || 'brown',
            // The last number is often the focal ratio or first distortion param
            k1: parseFloat(parts[6]) || 0,
            k2: 0, // Would need to get from cameras.json if available
        };
    };

    // ---------------------------------------------------------------------------
    //   LOAD CAMERAS (Icons + Drop Lines)
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (!camerasUrl || !viewerReady || !cesiumViewer.current) return;

        const loadCameras = async () => {
            try {
                const response = await fetch(camerasUrl);
                if (!response.ok) return;
                const data = await response.json();

                if (!camerasDataSourceRef.current) {
                    const ds = new CesiumJs.CustomDataSource("drone-cameras");
                    cesiumViewer.current!.dataSources.add(ds);
                    camerasDataSourceRef.current = ds;
                }

                const dataSource = camerasDataSourceRef.current;
                dataSource.entities.removeAll();

                // Compute the local-to-ECEF transform using the first camera as reference
                if (data.features.length > 0) {
                    const firstFeature = data.features[0];
                    const [refLon, refLat, refAlt] = firstFeature.geometry.coordinates;
                    
                    // Create ENU frame at reference point
                    const refCartesian = CesiumJs.Cartesian3.fromDegrees(refLon, refLat, 0);
                    localToWorldTransformRef.current = CesiumJs.Transforms.eastNorthUpToFixedFrame(refCartesian);
                }


                // Load a camera icon (You can use a local asset or a base64 string)
                // Using a standard map pin style for now, or ensure you have /camera-icon.png in public folder
                const cameraIconUrl = "https://cdn-icons-png.flaticon.com/512/3687/3687416.png"; 

                data.features.forEach((feature: any) => {
                    const [lon, lat, alt] = feature.geometry.coordinates;
                    const props = feature.properties;
                    const filename = feature.properties.filename;
                    
                    const position = CesiumJs.Cartesian3.fromDegrees(lon, lat, alt);
                    const groundPosition = CesiumJs.Cartesian3.fromDegrees(lon, lat, 0); // Ground level anchor

                    const cameraModel = parseCameraModel(props.camera);

                    // Store complete camera data for projection
                    const cameraData = {
                        filename: props.filename,
                        focal: props.focal,
                        width: props.width || cameraModel.width,
                        height: props.height || cameraModel.height,
                        k1: cameraModel.k1 || 0,
                        k2: cameraModel.k2 || 0,
                        translation: props.translation,
                        rotation: props.rotation,
                        gpsPosition: { lon, lat, alt }
                    };

                    //const rotationVector = feature.properties.rotation; 
                  
                    const orientation = getOrientationFromRodrigues(CesiumJs, props.rotation);

                    dataSource.entities.add({
                        position: position,
                        orientation: orientation,
                        
                        // 1. The Camera Icon (Billboard)
                        billboard: {
                            image: cameraIconUrl,
                            scale: 0.06, 
                            color: CesiumJs.Color.WHITE, 
                            verticalOrigin: CesiumJs.VerticalOrigin.BOTTOM,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY, 
                            heightReference: CesiumJs.HeightReference.NONE,
                            alignedAxis: CesiumJs.Cartesian3.UNIT_Z, 
                            rotation: 0,
                        },

                        // 2. The "Drop Line" (Anchor to ground) - Helps depth perception
                        polyline: {
                            positions: [position, groundPosition],
                            width: 1,
                            material: new CesiumJs.ColorMaterialProperty(
                                CesiumJs.Color.WHITE.withAlpha(0.4)
                            ),
                            distanceDisplayCondition: new CesiumJs.DistanceDisplayCondition(0.0, 200.0)
                        },

                        // Metadata
                        properties: {
                            type: 'camera-point',
                            filename: filename,
                            cameraData: cameraData,
                            rawData: feature.properties,
                            exactPosition: { lon, lat, alt }
                        }
                    });
                });

            } catch (error) {
                console.error("Error loading cameras:", error);
            }
        };

        loadCameras();

        return () => {
            if (cesiumViewer.current && camerasDataSourceRef.current) {
                cesiumViewer.current.dataSources.remove(camerasDataSourceRef.current);
                camerasDataSourceRef.current = null;
            }
        };
    }, [camerasUrl, viewerReady, CesiumJs]);


    // ---------------------------------------------------------------------------
    //  CLICK HANDLER 
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (!cesiumViewer.current) return;
        
        const handler = new CesiumJs.ScreenSpaceEventHandler(cesiumViewer.current.scene.canvas);
        
        handler.setInputAction((click: any) => {
            if (drawingMode !== 'none') return;

            const scene = cesiumViewer.current!.scene;
            const pickedObject = cesiumViewer.current!.scene.pick(click.position);
            
            if (CesiumJs.defined(pickedObject) && pickedObject.id instanceof CesiumJs.Entity) {
                const entity = pickedObject.id;

                // CASE A: Defect Selected
                if (entity.properties && entity.properties.hasProperty('detectionData')) {
                    const currentTime = cesiumViewer.current!.clock.currentTime;
                    const defectData = entity.properties.getValue(currentTime)['detectionData'];
                    if (onDefectSelected && defectData) {
                        onDefectSelected(defectData);
                    }
                }
                
                // CASE B: Camera Selected
                else if (entity.properties && entity.properties.hasProperty('type') &&
                        entity.properties.getValue(CesiumJs.JulianDate.now()).type === 'camera-point') {
                    
                    // --- A. RESET PREVIOUS ---
                    if (selectedCameraEntity.current) {
                        // Reset previous icon to White and normal size
                        selectedCameraEntity.current.billboard!.color = new CesiumJs.ConstantProperty(CesiumJs.Color.WHITE);
                        selectedCameraEntity.current.billboard!.scale = new CesiumJs.ConstantProperty(0.06);
                    }

                    //
                    // Make it Green (Lime) and 50% larger
                    entity.billboard!.color = new CesiumJs.ConstantProperty(CesiumJs.Color.LIME);
                    entity.billboard!.scale = new CesiumJs.ConstantProperty(0.1);
                    selectedCameraEntity.current = entity;

                    // ---  LOAD IMAGE ---
                    const filename = entity.properties.getValue(CesiumJs.JulianDate.now()).filename;
                    const pos = entity.properties.getValue(CesiumJs.JulianDate.now()).exactPosition;

                    if (proxyBaseUrl && filename) {
                        setSelectedImage(`${proxyBaseUrl}/${filename}`);
                    }

                    // --- . FLY TO ---
                    // cesiumViewer.current!.camera.flyTo({
                    //     destination: CesiumJs.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt),
                    //     orientation: {
                    //         heading: cesiumViewer.current!.camera.heading,
                    //         pitch: CesiumJs.Math.toRadians(-15),
                    //         roll: 0
                    //     },
                    //     duration: 1.5
                    // });
                }
            }
            // If we clicked the TILESET (The Building)
            else {
                // Get the exact 3D coordinate on the building
                const pickedPosition = scene.pickPosition(click.position);

                if (pickedPosition) {
                    console.log("Building Clicked at:", pickedPosition);
                    setTemp3DLocation(pickedPosition);
                    // 1. CALCULATE NORMAL (New)
                    const normal = getSurfaceNormal(scene, click.position);

                    // 2. PASS NORMAL TO FINDER
                    const cameras = camerasDataSourceRef.current?.entities.values || [];
                    
                    // Pass the normal to the ranking function
                    const bestCamera = findBestCamera(CesiumJs, pickedPosition, normal, cameras);

                    if (bestCamera) {
                        console.log("Best Camera Found:", bestCamera.properties?.getValue(CesiumJs.JulianDate.now()).filename);
                        
                        // B. Auto-select this camera
                        selectedCameraEntity.current = bestCamera;
                        
                        // C. Get the URL
                        const filename = bestCamera.properties?.getValue(CesiumJs.JulianDate.now()).filename;
                        // if (proxyBaseUrl && filename) {
                        //     setSelectedImage(`${proxyBaseUrl}/${filename}`);
                        // }

                        // D. Highlight it visually (Optional)
                        bestCamera.billboard!.color = new CesiumJs.ConstantProperty(CesiumJs.Color.LIME);
                        bestCamera.billboard!.scale = new CesiumJs.ConstantProperty(0.1);
                        
                        // E. Optional: Save the click position to state if you want to use it for the defect marker later
                        // setTemp3DLocation(pickedPosition); 
                    } else {
                        console.log("No suitable camera found for this location.");
                    }
                
                // This triggers the "Draft Mode"
                if (onDefectDetected) {
                    const draftCandidate: DefectCandidate = {
                        positions: [pickedPosition],
                        type: 'point',
                        measurement: 'Point',
                        labelPosition: pickedPosition,
                        // Optional: Pass pre-calculated data
                        locationOn3dModel: { 
                            type: 'point', 
                            coordinates: [{ x: pickedPosition.x, y: pickedPosition.y, z: pickedPosition.z }] 
                        }
                    };
                    
                    // We pass [] for entities because we aren't using the Drawing Manager's temp shapes
                    onDefectDetected(draftCandidate, []);
                    }
                }

            }

        }, CesiumJs.ScreenSpaceEventType.LEFT_CLICK);

        return () => handler.destroy();
    }, [CesiumJs, drawingMode, viewerReady, proxyBaseUrl, onDefectSelected, onDefectDetected]);

    // Reset highlight when image is closed
    useEffect(() => {
        if (!selectedImage && selectedCameraEntity.current) {
            selectedCameraEntity.current.billboard!.color = new CesiumJs.ConstantProperty(CesiumJs.Color.WHITE);
            selectedCameraEntity.current.billboard!.scale = new CesiumJs.ConstantProperty(0.06);
            selectedCameraEntity.current = null;
        }
    }, [selectedImage, CesiumJs]);



    
    // Effect to Fly To Defect when focusedDefectId changes
    useEffect(() => {
        if (!cesiumViewer.current || !focusedDefectId || !defectsDataSourceRef.current) return;

        const dataSource = defectsDataSourceRef.current;
        const entity = dataSource.entities.getById(focusedDefectId);

        if (entity) {
            cesiumViewer.current.flyTo(entity, {
                duration: 1.5,
                offset: new CesiumJs.HeadingPitchRange(
                    0, 
                    CesiumJs.Math.toRadians(-45), 
                    50 // Distance in meters
                )
            });
            // Optional: Select it visually
            cesiumViewer.current.selectedEntity = entity;
        }
    }, [focusedDefectId, CesiumJs]);

    // NEW: Handle Resize (Important for Split Pane)
    useEffect(() => {
        if (!cesiumContainerRef.current || !cesiumViewer.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (cesiumViewer.current && !cesiumViewer.current.isDestroyed()) {
                cesiumViewer.current.resize();
            }
        });
        
        resizeObserver.observe(cesiumContainerRef.current);

        return () => resizeObserver.disconnect();
    }, [viewerReady, cesiumContainerRef]);

    
        // EFFECT: Toggle Tileset Visibility
    useEffect(() => {
        if (!cesiumViewer.current || !currentTilesetRef.current) return;
        currentTilesetRef.current.show = showTileset;
    }, [showTileset]);

    // EFFECT: Toggle Defects Visibility
    useEffect(() => {
        if (!cesiumViewer.current || !defectsDataSourceRef.current) return;
        
        const entities = defectsDataSourceRef.current.entities.values;
        
        entities.forEach((entity: InstanceType<typeof CesiumJs.Entity>)  => {
            // Get the severity stored in the property bag
            // Note: Cesium properties can be tricky. We need to access the raw value.
            if (entity.properties && entity.properties.hasProperty('detectionData')) {
                const defectData = entity.properties.getValue(CesiumJs.JulianDate.now())['detectionData'];
                const severity = defectData.severity as keyof SeverityVisibility;
                
                // Show if the toggle for this severity is TRUE
                entity.show = severityVisibility[severity] ?? true; 
            }
        });
        
        // Force a re-render of the scene
        cesiumViewer.current.scene.requestRender();

    }, [severityVisibility, CesiumJs]);

    // 3. Initialize Viewer (With Strict Cleanup)
    useEffect(() => {
        if (!cesiumContainerRef.current) return;
        if (cesiumViewer.current && !cesiumViewer.current.isDestroyed()) return;


        // Safe token assignment
        CesiumJs.Ion.defaultAccessToken = '' // process.env.NEXT_PUBLIC_CESIUM_TOKEN || '';
        
        const imageryViewModels = basemapsLayers(CesiumJs);
        
        const viewer = new CesiumJs.Viewer(cesiumContainerRef.current, {
            creditContainer: document.createElement("div"),
        
            // ADD THESE LINES TO FIX THE OVERLAP:
            navigationHelpButton: false, // Hides the "?" button
            sceneModePicker: false,      // Hides the 2D/3D toggle (optional)
            //baseLayerPicker: false,      // Hides the map layer picker (since you have a custom one)

            geocoder: false,
            imageryProviderViewModels: imageryViewModels,
            selectedImageryProviderViewModel: imageryViewModels[0],
            animation: false,
            timeline: false,
            infoBox: false, 
            homeButton: false,
            fullscreenButton: false,
            selectionIndicator: false,
            orderIndependentTranslucency: false,
        });

        viewer.baseLayerPicker.viewModel.terrainProviderViewModels = [];
        viewer.clock.clockStep = CesiumJs.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
        (viewer.scene as any).pickTranslucentDepth = true;
        
        // Enable picking functions binding
        viewer.scene.pick = viewer.scene.pick.bind(viewer.scene);
        viewer.scene.pickPosition = viewer.scene.pickPosition.bind(viewer.scene);   

        // Initialize Data Source
        const dataSource = new CesiumJs.CustomDataSource("Defects");
        viewer.dataSources.add(dataSource);
        defectsDataSourceRef.current = dataSource;

        cesiumViewer.current = viewer;
        setViewerReady(true);

        // Cleanup to prevent "Fragment Shader" crash on re-mount
        return () => {
            if (cesiumViewer.current && !cesiumViewer.current.isDestroyed()) {
                try {
                    cesiumViewer.current.destroy();
                } catch (e) {
                    console.warn("Cesium destroy error", e);
                }
                cesiumViewer.current = null;
                setViewerReady(false);
                isLoaded.current = false;
            }
        };
    }, [CesiumJs, cesiumContainerRef]);

    // Helper to clean up primitives
    const cleanUpPrimitives = React.useCallback(() => {
        addedScenePrimitives.current.forEach(scenePrimitive => {
            if (cesiumViewer.current && !cesiumViewer.current.isDestroyed()) {
                cesiumViewer.current.scene.primitives.remove(scenePrimitive);
            }
        });
        addedScenePrimitives.current = [];
    }, []);

    // 4. Load Tileset 
    useEffect(() => {
        if (!viewerReady || isLoaded.current) return;

        const initializeCesiumJs = async () => {
            if (cesiumViewer.current !== null) {
                cleanUpPrimitives();

                try {
                    const loadTileset = async () => {
                        console.log("Loading Tileset from:", tilesetUrl);
                        
                        const tileset = await CesiumJs.Cesium3DTileset.fromUrl(tilesetUrl);

                        const result = await autoAlignTileset(
                            tileset,
                            cesiumViewer,
                            CesiumJs,
                            { debug: true }
                        );
                        console.log("Auto Align Result:", result);

                        currentTilesetRef.current = tileset;

                        // Add primitive manually as per your original logic
                        const targetBuildingsTilesetPrimitive = cesiumViewer.current!.scene.primitives.add(tileset);
                        addedScenePrimitives.current.push(targetBuildingsTilesetPrimitive);
                        
                        console.log('Tileset added');

                        await cesiumViewer.current!.zoomTo(tileset);

                        // Important settings for 3D tileset interaction
                        cesiumViewer.current!.scene.globe.depthTestAgainstTerrain = false;
                        //cesiumViewer.current!.scene.logarithmicDepthBuffer = true;
                    }

                    await loadTileset();
           
                } catch (error) {
                    console.error(`Error creating tileset: ${error}`);
                }

                // Set loaded flag
                isLoaded.current = true;
            }
        };

        initializeCesiumJs();
    }, [viewerReady, tilesetUrl, CesiumJs, cleanUpPrimitives]);

    // 5. Load Detections
    useEffect(() => {
        if (!viewerReady || !defectsDataSourceRef.current) return;

        clearActiveDrawing();
        const dataSource = defectsDataSourceRef.current;
        dataSource.entities.removeAll();

        console.log("Loading defects...", initialDetections.length);

        initialDetections.forEach(detection => {
             const location = detection.locationOn3dModel as any;
             if (!location || !location.coordinates) return;
             let pinPosition: Cartesian3 | null = null;
             const positions = location.coordinates.map(
                (pos: {x: number, y: number, z: number}) => 
                    new CesiumJs.Cartesian3(pos.x, pos.y, pos.z)
            );
            if (location?.coordinates && location.coordinates.length > 0) {
                 // Use the first point, or calculate center of the box
                 const p = location.coordinates[0];
                 pinPosition = new CesiumJs.Cartesian3(p.x, p.y, p.z);
             }

             if (!pinPosition) return;

            const propertyBag = new CesiumJs.PropertyBag();
            propertyBag.addProperty('detectionData', detection);
            
            //  Get the Dynamic Color
            const severityColor = getSeverityColor(CesiumJs, detection.severity || 'LOW');

            // RENDER AS BILLBOARD (PIN)
            dataSource.entities.add({
                id: detection.id,
                position: pinPosition,
                properties: propertyBag,
                billboard: {
                    image:triangleAlertSvg,
                    verticalOrigin: CesiumJs.VerticalOrigin.BOTTOM,
                    scale: 1.0,
                    color: severityColor,
                    heightReference: CesiumJs.HeightReference.NONE, // Exact 3D match
                    disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible on top
                }
            });
        });
    }, [viewerReady, initialDetections, CesiumJs, clearActiveDrawing]);

    // Handler for search selection
    const handleSearchSelect = (id: string) => {
        if (!cesiumViewer.current || !defectsDataSourceRef.current) return;
        
        const entity = defectsDataSourceRef.current.entities.getById(id);
        if (entity) {
            cesiumViewer.current.flyTo(entity, {
                duration: 1.5,
                offset: new CesiumJs.HeadingPitchRange(
                    0, 
                    CesiumJs.Math.toRadians(-45), 
                    30 // Closer zoom for search result
                )
            });
            cesiumViewer.current.selectedEntity = entity;
        }
    };

    const handleSave2DDefect = (data: { points: { x: number; y: number }[];
    imageId: string | null;
    defectId?: string | null;
    type: string;}) => {
        if (!onDefectDetected) return;

        if (data.type !== 'polygon' && data.type !== 'polyline') {
            console.warn('Unsupported drawing type:', data.type);
            return;
            }

        // 1. Validations
        if (!temp3DLocation) {
            console.warn("Cannot save defect: No 3D location found. Please click on the 3D model first.");
            return;
        }

        // 2. Construct the Hybrid Object
        // We use 'as any' here to bypass strict type checking locally, 
        const candidate: DefectCandidate = { // Explicitly type this to ensure match
                    // A. Geometry: Pass the single 3D anchor point so the 3D map knows where to put the pin
                    positions: [temp3DLocation], 
                    
                    // B. Type: Map the 2D tool type to your schema
                    type: data.type ,
                    
                    // C. Measurement: 
                    // Since we can't easily calculate real-world meters from pixels without depth data for every pixel,
                    // we leave this as "2D Annotation" or calculate a pixel-based metric if needed.
                    measurement: "2D Annotation", 
                    
                    // D. Label Position: The anchor point
                    labelPosition: temp3DLocation,
                    
                    // --- EXTENDED PROPS (The ones we added to the Form in the previous step) ---
                    // We cast to 'any' or update DefectCandidate interface to include these optional fields
                    ...({
                        annotation2D: data.points,
                        sourceImageId: data.imageId,
                        locationOn3dModel: { 
                            type: 'point', 
                            coordinates: [{ x: temp3DLocation.x, y: temp3DLocation.y, z: temp3DLocation.z }]
                        },
                        status: 'NEW', 
                        severity: 'LOW'
                    } as any)
                };

            onDefectDetected(candidate, []);
                // Close modal
            //setSelectedImage(null);
            setTemp3DLocation(null);
        };
    
    useEffect(() => {
            if (defectToEditImage && defectToEditImage.sourceImageId) {
                console.log("Opening Image for Edit:", defectToEditImage.sourceImageId);
                
                // 1. Construct URL
                const imageUrl = `${proxyBaseUrl}/${defectToEditImage.sourceImageId}`;
                
                // 2. Open Image Modal
                setSelectedImage(imageUrl);
            }
        }, [defectToEditImage, proxyBaseUrl]);

    const handleCrackProjection = async (points2D: { x: number; y: number }[]) => {
        console.log("╔═══════════════════════════════════════════════════════════╗");
        console.log("║  PROJECTION START                                         ║");
        console.log("╚═══════════════════════════════════════════════════════════╝");
        console.log(`📥 Received ${points2D?.length || 0} points`);

        if (!cesiumViewer.current || !selectedCameraEntity.current || !points2D.length) {
            console.error("❌ Missing required data");
            return;
        }

        const entity = selectedCameraEntity.current;
        const props = entity.properties!.getValue(CesiumJs.JulianDate.now());
        const cameraData = props.cameraData;
        const scene = cesiumViewer.current.scene;
        const tileset = currentTilesetRef.current;
        const localToWorldTransform = tileset && tileset.root && tileset.root.transform ? tileset.root.transform : CesiumJs.Matrix4.IDENTITY;

            // Force tileset refinement to improve picking
        if (tileset) {
            try {
                tileset.maximumScreenSpaceError = 1; // force high quality
                tileset.dynamicScreenSpaceError = false;
                tileset.maximumCacheOverflowBytes = Math.max(tileset.maximumCacheOverflowBytes || 512, 1024);
            } catch (e) {
                console.warn("Could not set tileset LOD hints:", e);
            }
        }

        console.log("📷 Camera:", cameraData.filename);

        // Camera position
        const cameraPosECEF = CesiumJs.Cartesian3.fromDegrees(
            cameraData.gpsPosition.lon,
            cameraData.gpsPosition.lat,
            cameraData.gpsPosition.alt
        );

        // Tileset info
        let distanceToTileset = 50;
        let tilesetCenterHeight = 0;
        let tilesetCenter: any = null;

        if (tileset?.boundingSphere) {
            tilesetCenter = tileset.boundingSphere.center;
            const tilesetCarto = CesiumJs.Cartographic.fromCartesian(tilesetCenter);
            tilesetCenterHeight = tilesetCarto.height;
            distanceToTileset = CesiumJs.Cartesian3.distance(cameraPosECEF, tilesetCenter);
            
            console.log(`📏 Distance to tileset: ${distanceToTileset.toFixed(2)}m`);
            console.log(`📏 Tileset center height: ${tilesetCenterHeight.toFixed(2)}m`);
            console.log(`📏 Tileset radius: ${tileset.boundingSphere.radius.toFixed(2)}m`);
        }

        // Make sure depth picking is enabled
        scene.globe.depthTestAgainstTerrain = true;
        scene.pickTranslucentDepth = true;

        // 1) Align Cesium camera to drone camera pose and FOV so pickPosition depth lines up
        await setCesiumCameraToDrone(CesiumJs, scene, cameraData, cameraPosECEF, localToWorldTransform);

        // Ensure the scene renders fully and tiles refine
        scene.requestRender();
        // wait briefly for depth buffer & tileset LOD which gives pickPosition a chance to succeed
        await new Promise<void>((resolve) => {
            let attempts = 0;
            const check = () => {
                attempts++;
                scene.requestRender();
                if ((!tileset || tileset.tilesLoaded) || attempts > 30) {
                    if (attempts > 30) console.warn("Timeout waiting for tiles to refine, proceeding anyway");
                    return resolve();
                }
                setTimeout(check, 150);
            };
            check();
        });

        // Precompute intrinsics
        const cx = cameraData.width / 2;
        const cy = cameraData.height / 2;
        const f = cameraData.focal * Math.max(cameraData.width, cameraData.height);
        console.log(`📷 Intrinsics: cx=${cx}, cy=${cy}, f=${f.toFixed(2)}`);

        // Rotation mat and transpose
        const R = rodriguesToMatrix(CesiumJs, cameraData.rotation);
        const Rt = CesiumJs.Matrix3.transpose(R, new CesiumJs.Matrix3());

        const worldPositions: any[] = [];
        const hitTypes: string[] = [];
        let tilesetHits = 0;

        for (let i = 0; i < points2D.length; i++) {
            const pixel = points2D[i];

            // --- produce normalized undistorted coords (your existing code)
            let xn = (pixel.x - cx) / f;
            let yn = (pixel.y - cy) / f;

            const k1 = cameraData.k1 || 0;
            const k2 = cameraData.k2 || 0;
            if (Math.abs(k1) > 1e-8 || Math.abs(k2) > 1e-8) {
                const xd = xn, yd = yn;
                for (let iter = 0; iter < 20; iter++) {
                    const r2 = xn * xn + yn * yn;
                    const r4 = r2 * r2;
                    const radialDist = 1 + k1 * r2 + k2 * r4;
                    xn = xd / radialDist;
                    yn = yd / radialDist;
                }
            }

            // Direction in camera coords, rotate into world and ECEF like before
            const dirCam = new CesiumJs.Cartesian3(xn, yn, 1.0);
            CesiumJs.Cartesian3.normalize(dirCam, dirCam);
            const dirLocal = CesiumJs.Matrix3.multiplyByVector(Rt, dirCam, new CesiumJs.Cartesian3());

            // Apply the same ENU transform that you used earlier
            const enuTransform = CesiumJs.Transforms.eastNorthUpToFixedFrame(cameraPosECEF);
            const enuRot = CesiumJs.Matrix4.getMatrix3(enuTransform, new CesiumJs.Matrix3());

            const dirENU = new CesiumJs.Cartesian3(dirLocal.x, dirLocal.y, dirLocal.z);
            const dirECEF = CesiumJs.Matrix3.multiplyByVector(enuRot, dirENU, new CesiumJs.Cartesian3());
            CesiumJs.Cartesian3.normalize(dirECEF, dirECEF);

            const dotWithDown = CesiumJs.Cartesian3.dot(
                dirECEF,
                CesiumJs.Cartesian3.normalize(
                    CesiumJs.Cartesian3.negate(cameraPosECEF, new CesiumJs.Cartesian3()),
                    new CesiumJs.Cartesian3()
                )
            );
            console.log(`  Pixel ${i}: (${pixel.x.toFixed(0)}, ${pixel.y.toFixed(0)}) → normalized (${xn.toFixed(4)}, ${yn.toFixed(4)})`);
            console.log(` Direction dot with down: ${dotWithDown.toFixed(4)} (should be positive for downward)`);

            // Build ray
            const ray = new CesiumJs.Ray(cameraPosECEF, dirECEF);

            // Debug ray preview
            const rayEndpoint = CesiumJs.Ray.getPoint(ray, Math.min(distanceToTileset, 100));
            defectsDataSourceRef.current!.entities.add({
                id: `debug_ray_${i}_${Date.now()}`,
                polyline: {
                    positions: [cameraPosECEF, rayEndpoint],
                    width: 2,
                    material: CesiumJs.Color.MAGENTA.withAlpha(0.5)
                }
            });

            // ====== NEW: map to window coords and use pickPosition first ======
            // Pick a test point somewhere near the tileset along the ray so screen mapping matches pixel
            const testDist = Math.min(distanceToTileset, 100); // pick a sensible distance
            const testPoint = CesiumJs.Ray.getPoint(ray, testDist);

            const screenPosRaw = CesiumJs.SceneTransforms.worldToWindowCoordinates(scene, testPoint);
            let finalPosition: any = null;
            let hitType: string = 'none';

            if (screenPosRaw && Number.isFinite(screenPosRaw.x) && Number.isFinite(screenPosRaw.y)) {
                const windowPos = new CesiumJs.Cartesian2(screenPosRaw.x, screenPosRaw.y);

                // Ensure a render so depth buffer is ready
                scene.requestRender();

                try {
                    const picked = scene.pickPosition(windowPos);
                    const centerScreen = new CesiumJs.Cartesian2(scene.canvas.clientWidth/2, scene.canvas.clientHeight/2);
                    console.log('center pick', scene.pickPosition(centerScreen));

                    if (picked) {
                        finalPosition = picked;
                        hitType = 'pickPosition-tileset';
                        tilesetHits++;
                    }
                } catch (e) {
                    console.debug("pickPosition error:", e);
                }
            }

            // If pickPosition failed, fallback to your existing ray intersection (unchanged)
            if (!finalPosition) {
                const intersection = await intersectRayWithTileset(
                    CesiumJs, scene, ray, tileset, distanceToTileset * 3, cameraPosECEF
                );

                const isValidHit = intersection && !intersection.hitType.includes('boundingSphere');

                if (isValidHit) {
                    finalPosition = intersection!.position;
                    hitType = intersection!.hitType;
                    if (hitType.includes('tileset')) tilesetHits++;
                } else {
                    // fallback plane projection (you had this)
                    const planeHit = intersectRayWithPlane(CesiumJs, ray, tilesetCenterHeight || 0);
                    if (planeHit) {
                        finalPosition = planeHit;
                        hitType = 'fallback-plane';
                        // optionally count this as a hit
                        // tilesetHits++;
                    } else {
                        finalPosition = CesiumJs.Ray.getPoint(ray, distanceToTileset);
                        hitType = 'fallback-floating';
                    }
                }
            }

            // Log and store
            const hitCarto = CesiumJs.Cartographic.fromCartesian(finalPosition);
            const distFromCamera = CesiumJs.Cartesian3.distance(cameraPosECEF, finalPosition);

            console.log(`Point ${i}: (${pixel.x.toFixed(0)}, ${pixel.y.toFixed(0)}) → ${hitType}`);
            console.log(`  ↳ Height: ${hitCarto.height.toFixed(2)}m, Dist: ${distFromCamera.toFixed(2)}m`);

            hitTypes.push(hitType);
            worldPositions.push(finalPosition);
        } // end loop over points

        console.log(`📊 Tileset hits: ${tilesetHits}/${points2D.length}`);
        console.log(`📊 Hit types: ${[...new Set(hitTypes)].join(', ')}`);

        if (worldPositions.length < 2) {
            console.error("❌ Insufficient points");
            return;
        }

        // Visualization unchanged (polyline, points)...
        const id = `projection_${Date.now()}`;
        const color = tilesetHits >= points2D.length / 2 ? CesiumJs.Color.LIME : CesiumJs.Color.YELLOW;

        defectsDataSourceRef.current!.entities.add({
            id: id,
            polyline: {
                positions: worldPositions,
                width: 10,
                material: new CesiumJs.PolylineGlowMaterialProperty({
                    glowPower: 0.4,
                    color: color
                }),
                clampToGround: true,
                classificationType: CesiumJs.ClassificationType.CESIUM_3D_TILE,
                arcType: CesiumJs.ArcType.GEODESIC,
            }
        });

        worldPositions.forEach((pos, idx) => {
            const ht = hitTypes[idx];
            let ptColor = CesiumJs.Color.ORANGE;
            if (ht.includes('tileset')) ptColor = CesiumJs.Color.LIME;
            else if (ht.includes('globe')) ptColor = CesiumJs.Color.CYAN;
            else if (ht === 'boundingSphere') ptColor = CesiumJs.Color.YELLOW;
            else if (ht.includes('fallback')) ptColor = CesiumJs.Color.ORANGE;

            defectsDataSourceRef.current!.entities.add({
                id: `${id}_pt_${idx}`,
                position: pos,
                point: {
                    pixelSize: 14,
                    color: ptColor,
                    outlineColor: CesiumJs.Color.BLACK,
                    outlineWidth: 3,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                }
            });
        });

        console.log(`✅ Created: ${id}`);

        // Fly to see result
        cesiumViewer.current.flyTo(defectsDataSourceRef.current!.entities.getById(id)!, {
            duration: 1.0,
            offset: new CesiumJs.HeadingPitchRange(0, CesiumJs.Math.toRadians(-45), distanceToTileset * 0.8)
        });

        scene.requestRender();
    };

    return (
        <div className="relative w-full h-full">
            <div ref={cesiumContainerRef} className="w-full h-full" suppressHydrationWarning={true}/>

            {/* --- IMAGE OVERLAY MODAL --- */}
            {selectedImage && (
                <ImageViewerModal 
                    src={selectedImage} 
                    imageId={defectToEditImage?.sourceImageId || selectedCameraEntity.current?.properties?.getValue(CesiumJs.JulianDate.now())?.filename}
                    onClose={() => {setSelectedImage(null); 
                                    onCloseImageEdit();}} 
                    onSave={handleSave2DDefect}
                    
                    
                    cameraContext={selectedCameraEntity.current ? getCameraContext(selectedCameraEntity.current, CesiumJs) : undefined}
                    
                    nearbyDefects={initialDetections}
                    
                    initialData={defectToEditImage ? {
                        id: defectToEditImage.id,
                        points: defectToEditImage.annotation2D as {x:number, y:number}[]
                    } : undefined}
                />
            
            )}

            {/* Toolbar with Dark Mode fix */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-2 bg-card border border-border rounded-lg shadow-md w-12 items-center">

                {/* Layer Control */}
                <LayerControl 
                    showTileset={showTileset}
                    toggleTileset={onToggleTileset}
                    severityVisibility={severityVisibility}
                    toggleSeverity={onToggleSeverity}
                    toggleAllDefects={onToggleAllDefects}
                />
                
                {/* <div className="h-px w-full bg-border my-1" /> */}

                {/* <Button
                    onClick={() => startDrawing('none')}
                    variant={drawingMode === 'none' ? 'default' : 'outline'}
                    size="sm"
                >
                    <Hand className="w-4 h-4" />
                </Button>
                <Button
                    onClick={() => startDrawing('polyline')}
                    variant={drawingMode === 'polyline' ? 'default' : 'outline'}
                    size="sm"
                >
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button
                    onClick={() => startDrawing('polygon')}
                    variant={drawingMode === 'polygon' ? 'default' : 'outline'}
                    size="sm"
                >
                    <Square className="w-4 h-4 rotate-45" />
                </Button>

                <div className="h-px w-full bg-border my-1" />
                
                <Button
                    onClick={() => clearActiveDrawing()}
                    variant="destructive"
                    size="sm"
                >
                    <Trash2 className="w-4 h-4" />
                </Button> */}

            </div>

            {/* --- TOP RIGHT CONTROLS CONTAINER --- */}
            <div className="absolute top-1 right-30 z-10 flex flex-col items-end gap-2">
                
                {/* Search & Primary Actions */}
                <div className="flex items-center gap-2">
                    {/* The Search Bar (Expands to the left) */}
                    {/* <DefectSearch 
                        defects={initialDetections} 
                        onSelectDefect={handleSearchSelect} 
                    /> */}
                  
                    {/* <Button variant="secondary" size="icon" className="shadow-md">
                        <Settings className="h-4 w-4" />
                    </Button> */}
                </div>

                {/* Row 2: Secondary Controls (Optional - stacked below) */}
            </div>

        {   isMapFullscreen &&
            (         
            <div className="absolute bottom-4 left-4 z-10 bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg text-xs">
                <div className="font-semibold mb-2 text-foreground">Defect Severity</div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div> 
                        <span className="text-muted-foreground">Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div> 
                        <span className="text-muted-foreground">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div> 
                        <span className="text-muted-foreground">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div> 
                        <span className="text-muted-foreground">Low</span>
                    </div>
                </div>
            </div>)
        }

            {/* <Button
                onClick={onFullscreenToggle}
                className="absolute bottom-4 right-4 z-10 rounded-full shadow-md"
                size="icon"
            >
                <LucideFullscreen className="w-4 h-4" />
            </Button> */}
        </div>
    );
};

export default CesiumComponent;