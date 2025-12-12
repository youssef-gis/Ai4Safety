'use client'

import React, { useEffect, useRef, useState } from 'react';
import { 
    CustomDataSource,
    Entity,
    Viewer,
    Cesium3DTileset,
    Scene,
    Cartesian3
} from 'cesium';
import { useRouter } from 'next/navigation';

import { CesiumType } from './types/cesium';
import { basemapsLayers } from './imagery_basemaps';
import { autoAlignTileset } from './auto-align-tileset';
import { Button } from '../ui/button';
import { Pencil, Square, Trash2, Hand, LucideFullscreen, X } from 'lucide-react';
import { useDrawingManager } from './hooks/use-drawing-manager';
import { CesiumComponentProps } from './CesiumWrapper';
import { LayerControl, SeverityVisibility } from './components/layer-control';
import { DefectSearch } from './components/defect-search';
import { getOrientationFromRodrigues} from './get-Orientation-From-Rodrigues';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import Image from 'next/image';
import { ImageViewerModal } from '../image-viewer-modal';
import { getCameraPositionECEF, getRayFromPixel, intersectRayWithTileset, rodriguesToMatrix, snapPointToTileset } from './get-Ray-From-Pixel';
import { debugCameraProjection } from './debug-projection';
//import "@cesium/widgets/styles.css";


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
    layers
}) => {
    
    // Fix global variable assignment
    // if (typeof window !== 'undefined') {
    //     (window as any).CESIUM_BASE_URL = '/cesium';
    // };

    useEffect(() => {
        (window as any).CESIUM_BASE_URL = '/cesium';
    }, [])

    const cesiumViewer = useRef<Viewer | null>(null);
    const defectsDataSourceRef = useRef<CustomDataSource | null>(null);
    const camerasDataSourceRef = useRef<CustomDataSource | null>(null);
    
    const addedScenePrimitives = useRef<Cesium3DTileset[]>([]);
    const currentTilesetRef = useRef<Cesium3DTileset | null>(null);
    const isLoaded = useRef(false);
    const [viewerReady, setViewerReady] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const selectedCameraEntity = useRef<Entity | null>(null);
    const localToWorldTransformRef = useRef<any>(null);


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
                // This should ideally come from WebODM's georeferencing info
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
    //  CLICK HANDLER (Updated for Cameras)
    // ---------------------------------------------------------------------------
    useEffect(() => {
        if (!cesiumViewer.current) return;
        
        const handler = new CesiumJs.ScreenSpaceEventHandler(cesiumViewer.current.scene.canvas);
        
        handler.setInputAction((click: any) => {
            if (drawingMode !== 'none') return;

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
                
                // CASE B: Camera Selected (NEW)
                else if (entity.properties && entity.properties.hasProperty('type') && entity.properties.getValue(CesiumJs.JulianDate.now()).type === 'camera-point') {
                    
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

                    // --- C. LOAD IMAGE ---
                    const filename = entity.properties.getValue(CesiumJs.JulianDate.now()).filename;
                    const pos = entity.properties.getValue(CesiumJs.JulianDate.now()).exactPosition;

                    if (proxyBaseUrl && filename) {
                        setSelectedImage(`${proxyBaseUrl}/${filename}`);
                    }

                    // --- D. FLY TO ---
                    cesiumViewer.current!.camera.flyTo({
                        destination: CesiumJs.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt),
                        orientation: {
                            heading: cesiumViewer.current!.camera.heading,
                            pitch: CesiumJs.Math.toRadians(-15),
                            roll: 0
                        },
                        duration: 1.5
                    });
                }
            }

        }, CesiumJs.ScreenSpaceEventType.LEFT_CLICK);

        return () => handler.destroy();
    }, [CesiumJs, onDefectSelected, drawingMode, viewerReady, proxyBaseUrl]);

    // Reset highlight when image is closed
    useEffect(() => {
        if (!selectedImage && selectedCameraEntity.current) {
            selectedCameraEntity.current.billboard!.color = new CesiumJs.ConstantProperty(CesiumJs.Color.WHITE);
            selectedCameraEntity.current.billboard!.scale = new CesiumJs.ConstantProperty(0.06);
            selectedCameraEntity.current = null;
        }
    }, [selectedImage, CesiumJs]);

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

        const cameraCarto = CesiumJs.Cartographic.fromCartesian(cameraPosECEF);
        console.log(`📷 Camera height: ${cameraCarto.height.toFixed(2)}m`);

        // ENU frame
        const enuTransform = CesiumJs.Transforms.eastNorthUpToFixedFrame(cameraPosECEF);
        const enuRot = CesiumJs.Matrix4.getMatrix3(enuTransform, new CesiumJs.Matrix3());

        // Wait for tiles
        if (tileset && !tileset.tilesLoaded) {
            console.log("⏳ Waiting for tiles...");
            await new Promise<void>(resolve => {
                const check = () => tileset.tilesLoaded ? resolve() : setTimeout(check, 100);
                check();
            });
        }
        // ✅ Essential for accurate picking
        scene.globe.depthTestAgainstTerrain = true;
        scene.render();

        // Camera intrinsics
        const cx = cameraData.width / 2;
        const cy = cameraData.height / 2;
        const f = cameraData.focal * Math.max(cameraData.width, cameraData.height);

        console.log(`📷 Intrinsics: cx=${cx}, cy=${cy}, f=${f.toFixed(2)}`);

        // Rotation
        const R = rodriguesToMatrix(CesiumJs, cameraData.rotation);
        const Rt = CesiumJs.Matrix3.transpose(R, new CesiumJs.Matrix3());

        const worldPositions: any[] = [];
        const hitTypes: string[] = [];
        let tilesetHits = 0;

        for (let i = 0; i < points2D.length; i++) {
            const pixel = points2D[i];

            // Normalized coordinates
            let xn = (pixel.x - cx) / f;
            let yn = (pixel.y - cy) / f;

            console.log(`  Pixel ${i}: (${pixel.x}, ${pixel.y}) → normalized (${xn.toFixed(4)}, ${yn.toFixed(4)})`);

            // Undistort
            const k1 = cameraData.k1 || 0;
            const k2 = cameraData.k2 || 0;
            if (Math.abs(k1) > 1e-8 || Math.abs(k2) > 1e-8) {
                const xd = xn, yd = yn;
                // Newton-Raphson iteration for undistortion
                for (let iter = 0; iter < 20; iter++) {
                    const r2 = xn * xn + yn * yn;
                    const r4 = r2 * r2;
                    const radialDist = 1 + k1 * r2 + k2 * r4;
                    xn = xd / radialDist;
                    yn = yd / radialDist;
                }
                console.log(`  Undistorted: (${xn.toFixed(4)}, ${yn.toFixed(4)})`);
            }

            // Direction
            const dirCam = new CesiumJs.Cartesian3(xn, yn, 1.0);
            CesiumJs.Cartesian3.normalize(dirCam, dirCam);

            const dirLocal = CesiumJs.Matrix3.multiplyByVector(Rt, dirCam, new CesiumJs.Cartesian3());
            
            const dirENU = new CesiumJs.Cartesian3(
                            dirLocal.x,      // East stays East
                            dirLocal.y,     // Flip North (OpenSfM Y convention)
                            dirLocal.z      // Flip Up (looking down from drone)
                        );

            const dirECEF = CesiumJs.Matrix3.multiplyByVector(enuRot, dirENU, new CesiumJs.Cartesian3());

            CesiumJs.Cartesian3.normalize(dirECEF, dirECEF);

            // Validate direction (should point generally towards ground/tileset)
            const dotWithDown = CesiumJs.Cartesian3.dot(
                dirECEF, 
                CesiumJs.Cartesian3.normalize(
                    CesiumJs.Cartesian3.negate(cameraPosECEF, new CesiumJs.Cartesian3()),
                    new CesiumJs.Cartesian3()
                )
            );
            console.log(` Direction dot with down: ${dotWithDown.toFixed(4)} (should be positive for downward)`);

            const ray = new CesiumJs.Ray(cameraPosECEF, dirECEF);

            const rayEndpoint = CesiumJs.Ray.getPoint(ray, 30); // 30m along ray
            defectsDataSourceRef.current!.entities.add({
                id: `debug_ray_${i}_${Date.now()}`,
                polyline: {
                    positions: [cameraPosECEF, rayEndpoint],
                    width: 2,
                    material: CesiumJs.Color.MAGENTA.withAlpha(0.5)
                }
            });

            const intersection = await intersectRayWithTileset(
                CesiumJs, scene, ray, tileset, distanceToTileset * 3, cameraPosECEF
            );

            let finalPosition: any;
            let hitType: string;

            if (intersection) {
                finalPosition = intersection.position;
                hitType = intersection.hitType;
                
                // Verify the hit is actually away from camera
                const dist = CesiumJs.Cartesian3.distance(cameraPosECEF, finalPosition);
                if (dist < 1 || dist > distanceToTileset * 5) {
                    // Bad hit - use fallback
                    console.warn(`Point ${i}: Hit too close (${dist.toFixed(2)}m), using fallback`);
                    finalPosition = CesiumJs.Ray.getPoint(ray, distanceToTileset);
                    hitType = 'corrected-fallback';
                }
                
                if (hitType.includes('tileset')) {
                    tilesetHits++;
                }
            } else {// ✅ NEW: Smart Fallback
                // 1. Calculate where the point "should" be in the air
                const estimatedPoint = CesiumJs.Ray.getPoint(ray, distanceToTileset);
                
                // 2. Try to drop a vertical line down to find the tileset surface
                // (Make sure snapPointToTileset is imported from your utils file)
                const snapResult = await snapPointToTileset(
                    CesiumJs, 
                    scene, 
                    estimatedPoint, 
                    tileset, 
                    50 // Look up/down 50 meters
                );

                if (snapResult.success) {
                    finalPosition = snapResult.position;
                    hitType = 'fallback-vertical-snap';
                    
                } else {
                    finalPosition = estimatedPoint;
                    hitType = 'fallback-floating';
                }
            }

            // Log with verification
            const hitCarto = CesiumJs.Cartographic.fromCartesian(finalPosition);
            const distFromCamera = CesiumJs.Cartesian3.distance(cameraPosECEF, finalPosition);

            console.log(`Point ${i}: (${pixel.x.toFixed(0)}, ${pixel.y.toFixed(0)}) → ${hitType}`);
            console.log(`  ↳ Height: ${hitCarto.height.toFixed(2)}m, Dist: ${distFromCamera.toFixed(2)}m`);

            hitTypes.push(hitType);
            worldPositions.push(finalPosition);
        }

        console.log(`📊 Tileset hits: ${tilesetHits}/${points2D.length}`);
        console.log(`📊 Hit types: ${[...new Set(hitTypes)].join(', ')}`);

        if (worldPositions.length < 2) {
            console.error("❌ Insufficient points");
            return;
        }

        // Create visualization
        const id = `projection_${Date.now()}`;
        const color = tilesetHits >= points2D.length / 2 ? CesiumJs.Color.LIME : CesiumJs.Color.YELLOW;

        // POLYLINE
        defectsDataSourceRef.current!.entities.add({
            id: id,
            polyline: {
                positions: worldPositions,
                width: 10,
                material: new CesiumJs.PolylineGlowMaterialProperty({
                    glowPower: 0.4,
                    color: color
                }),

                clampToGround: false,
                arcType: CesiumJs.ArcType.NONE
            }
        });

        // POINT MARKERS - with visibility
        worldPositions.forEach((pos, idx) => {
            const ht = hitTypes[idx];
            let color = CesiumJs.Color.ORANGE;
            if (ht.includes('tileset')) color = CesiumJs.Color.LIME;
            else if (ht.includes('globe')) color = CesiumJs.Color.CYAN;
            else if (ht === 'boundingSphere') color = CesiumJs.Color.YELLOW;
            else if (ht.includes('fallback')) color = CesiumJs.Color.ORANGE;

            defectsDataSourceRef.current!.entities.add({
                id: `${id}_pt_${idx}`,
                position: pos,
                point: {
                    pixelSize: 14,
                    color: color,
                    outlineColor: CesiumJs.Color.BLACK,
                    outlineWidth: 3,
                    // Use a moderate value - visible but with depth awareness
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    
                }
            });
        });

        console.log(`✅ Created: ${id}`);
        
        // Fly to see the result
        cesiumViewer.current.flyTo(defectsDataSourceRef.current!.entities.getById(id)!, {
            duration: 1.0,
            offset: new CesiumJs.HeadingPitchRange(0, CesiumJs.Math.toRadians(-45), distanceToTileset*0.8)
        });

        scene.requestRender();
    };

    
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
        
        entities.forEach(entity => {
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
        if (cesiumViewer.current || !cesiumContainerRef.current) return;

        // Safe token assignment
        CesiumJs.Ion.defaultAccessToken = '' // process.env.NEXT_PUBLIC_CESIUM_TOKEN || '';
        
        const imageryViewModels = basemapsLayers(CesiumJs);
        
        const viewer = new CesiumJs.Viewer(cesiumContainerRef.current, {
            creditContainer: document.createElement("div"),
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
        const dataSource = new CustomDataSource("Defects");
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
                        cesiumViewer.current!.scene.logarithmicDepthBuffer = true;
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
             
             const positions = location.coordinates.map(
                (pos: {x: number, y: number, z: number}) => 
                    new CesiumJs.Cartesian3(pos.x, pos.y, pos.z)
            );
            
            const propertyBag = new CesiumJs.PropertyBag();
            propertyBag.addProperty('detectionData', detection);
            
            //  Get the Dynamic Color
            const severityColor = getSeverityColor(CesiumJs, detection.severity || 'LOW');


            const entity = new CesiumJs.Entity({
                id: detection.id,
                properties: propertyBag,
            });

            if (location.type === 'polyline') {
                entity.polyline = new CesiumJs.PolylineGraphics({
                    positions: positions,
                    width: 5,
                     material: new CesiumJs.ColorMaterialProperty(severityColor),
                    arcType: new CesiumJs.ConstantProperty(CesiumJs.ArcType.NONE),
                });
            } else if (location.type === 'polygon') {
                entity.polygon = new CesiumJs.PolygonGraphics({
                    hierarchy: new CesiumJs.PolygonHierarchy(positions),
                    material: new CesiumJs.ColorMaterialProperty(severityColor.withAlpha(0.5)),
                    perPositionHeight: new CesiumJs.ConstantProperty(true),
                    outline: true,
                    outlineColor: CesiumJs.Color.BLACK,
                });
            }
            dataSource.entities.add(entity);

            // Add Labels if they exist
            if (location.measurement && location.labelPosition) {
                const labelPos = new CesiumJs.Cartesian3(
                    location.labelPosition.x,
                    location.labelPosition.y,
                    location.labelPosition.z
                );
                dataSource.entities.add(new CesiumJs.Entity({
                    id: `${detection.id}_label`,
                    position: labelPos,
                    label: {
                        text: location.measurement,
                        font: '14px sans-serif',
                        fillColor: CesiumJs.Color.WHITE,
                        showBackground: true,
                        backgroundColor: CesiumJs.Color.BLACK.withAlpha(0.7),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        pixelOffset: new CesiumJs.Cartesian2(0, -20)
                    }
                }));
            }
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


    return (
        <div className="relative w-full h-full">
            <div ref={cesiumContainerRef} className="w-full h-full" suppressHydrationWarning={true}/>

            {/* --- NEW: IMAGE OVERLAY MODAL --- */}
            {selectedImage && selectedCameraEntity.current && (
                <ImageViewerModal 
                    src={selectedImage} 
                    onClose={() => setSelectedImage(null)} 
                    onSaveDrawing={handleCrackProjection}
                    expectedWidth={
                        selectedCameraEntity.current.properties?.getValue(CesiumJs.JulianDate.now())?.cameraData?.width
                    }
                    expectedHeight={
                        selectedCameraEntity.current.properties?.getValue(CesiumJs.JulianDate.now())?.cameraData?.height
                    }
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
                
                <div className="h-px w-full bg-border my-1" />

                <Button
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
                </Button>

            </div>

            {/* --- TOP RIGHT CONTROLS CONTAINER --- */}
            <div className="absolute top-1 right-30 z-10 flex flex-col items-end gap-2">
                
                {/* Search & Primary Actions */}
                <div className="flex items-center gap-2">
                    {/* The Search Bar (Expands to the left) */}
                    <DefectSearch 
                        defects={initialDetections} 
                        onSelectDefect={handleSearchSelect} 
                    />
                  
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

            <Button
                onClick={onFullscreenToggle}
                className="absolute bottom-4 right-4 z-10 rounded-full shadow-md"
                size="icon"
            >
                <LucideFullscreen className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default CesiumComponent;