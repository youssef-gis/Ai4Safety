'use client'

import React, { useEffect, useRef, useState } from 'react';
import { 
    CustomDataSource,
    Entity,
    Viewer,
    Cesium3DTileset
} from 'cesium';
import { useRouter } from 'next/navigation';

import { CesiumType } from './types/cesium';
import { basemapsLayers } from './imagery_basemaps';
import { autoAlignTileset } from './auto-align-tileset';
import { Button } from '../ui/button';
import { Pencil, Square, Trash2, Hand, LucideFullscreen } from 'lucide-react';
import { useDrawingManager } from './hooks/use-drawing-manager';
import { CesiumComponentProps } from './CesiumWrapper';
import { LayerControl, SeverityVisibility } from './components/layer-control';
import { DefectSearch } from './components/defect-search';

import 'cesium/Build/Cesium/Widgets/widgets.css';
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
}) => {
    const router = useRouter();
    
    // Fix global variable assignment
    if (typeof window !== 'undefined') {
        (window as any).CESIUM_BASE_URL = '/cesium';
    }

    const cesiumViewer = useRef<Viewer | null>(null);
    const defectsDataSourceRef = useRef<CustomDataSource | null>(null);
    
    
    const addedScenePrimitives = useRef<Cesium3DTileset[]>([]);
    const currentTilesetRef = useRef<Cesium3DTileset | null>(null);
    const isLoaded = useRef(false);
    const [viewerReady, setViewerReady] = useState(false);

    
    const { 
        drawingMode, 
        startDrawing, 
        clearActiveDrawing 
    } = useDrawingManager({
        CesiumJs,
        viewer: cesiumViewer.current,
        onShapeCreated: (candidate, entities) => {
            if (onDefectDetected) {
                onDefectDetected(candidate, entities);
            }
        }
    });

    // 2. Click Handler for Selection
    useEffect(() => {
        if (!cesiumViewer.current) return;
        
        const handler = new CesiumJs.ScreenSpaceEventHandler(cesiumViewer.current.scene.canvas);
        
        handler.setInputAction((click: any) => {
            if (drawingMode !== 'none') return;

            const pickedObject = cesiumViewer.current!.scene.pick(click.position);
            
            if (CesiumJs.defined(pickedObject) && pickedObject.id instanceof CesiumJs.Entity) {
                const entity = pickedObject.id;
                // Check if the entity has the custom detectionData property
                if (entity.properties && entity.properties.hasProperty('detectionData')) {
                    
                    const currentTime = cesiumViewer.current!.clock.currentTime;
                    const defectData = entity.properties.getValue(currentTime)['detectionData'];
                    
                    if (onDefectSelected && defectData) {
                        onDefectSelected(defectData);
                    }
                }
            }
        }, CesiumJs.ScreenSpaceEventType.LEFT_CLICK);

        return () => handler.destroy();
    }, [CesiumJs, drawingMode, onDefectSelected]);


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
            <div ref={cesiumContainerRef} className="w-full h-full" />

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