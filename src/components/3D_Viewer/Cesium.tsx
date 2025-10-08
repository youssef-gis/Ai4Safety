'use client'

import React from 'react'

import { Cesium3DTileset, createWorldTerrainAsync , ProviderViewModel, type Entity, type Viewer } from 'cesium';

import { CesiumType } from './types/cesium';

import { Position } from './types/position';

import {basemapsLayers} from './imagery_basemaps'

//NOTE: It is important to assign types using "import type", not "import"
import { dateToJulianDate } from './example_utils/date';
//NOTE: This is required to get the stylings for default Cesium UI and controls
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { CesiumComponentProps } from './CesiumWrapper';
import { LucideFullscreen, Pencil, Square, Circle, Trash2, Edit, Hand, MapPin } from 'lucide-react';
import { Button } from '../ui/button';


type DrawingMode = 'none' | 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle';

interface MeasurementInfo {
    type: 'distance' | 'area' | 'radius';
    value: number;
    unit: string;
    formattedValue: string;
}

export const CesiumComponent: React.FunctionComponent<{
    CesiumJs: CesiumType,
    cesiumContainerRef: React.RefObject<HTMLDivElement | null> ; // Accept the ref here
    onFullscreenToggle?: () => void; // Optional: if you want Cesium to trigger the toggle
    isMapFullscreen?: boolean; // Optional: to know the fullscreen state within Cesium
    tilesetUrl: string;
    
}> = ({
    CesiumJs,
    cesiumContainerRef, // Use the passed ref
    onFullscreenToggle,
    isMapFullscreen,  
    tilesetUrl  
}) => {
    (window as any ).CESIUM_BASE_URL = '/cesium';
    const cesiumViewer = React.useRef<Viewer | null>(null);
    //const cesiumContainerRef = React.useRef<HTMLDivElement>(null);
    const addedScenePrimitives = React.useRef<Cesium3DTileset[]>([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const currentTilesetRef = React.useRef<Cesium3DTileset | null>(null);

    // Drawing state
    const [currentDrawingMode, setCurrentDrawingMode] = React.useState<DrawingMode>('none');
    const [drawnEntities, setDrawnEntities] = React.useState<Entity[]>([]);
    const activePointsRef = React.useRef<any[]>([]);
    const drawingHandlerRef = React.useRef<any>(null);
    const activeShapeRef = React.useRef<Entity | null>(null);

    const measurementLabelsRef = React.useRef<Entity[]>([]);
    
    // Measurement state
    const [currentMeasurement, setCurrentMeasurement] = React.useState<MeasurementInfo | null>(null);
    const [showMeasurements, setShowMeasurements] = React.useState(true);


    //let imageryViewModels: ProviderViewModel[]
    const imageryViewModels =   basemapsLayers(CesiumJs);


    // Helper function to format distance
    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${meters.toFixed(2)} m`;
        } else {
            return `${(meters / 1000).toFixed(3)} km`;
        }
    };

    // Helper function to format area
    const formatArea = (squareMeters: number): string => {
        if (squareMeters < 10000) {
            return `${squareMeters.toFixed(2)} m²`;
        } else if (squareMeters < 1000000) {
            return `${(squareMeters / 10000).toFixed(4)} ha`;
        } else {
            return `${(squareMeters / 1000000).toFixed(4)} km²`;
        }
    };

    // Calculate total distance of a polyline
    const calculatePolylineDistance = React.useCallback((positions: any[]): number => {
        let totalDistance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            totalDistance += CesiumJs.Cartesian3.distance(positions[i], positions[i + 1]);
        }
        return totalDistance;
    }, [CesiumJs]);

    // Calculate area of a polygon
    const calculatePolygonArea = React.useCallback((positions: any[]): number => {
        if (positions.length < 3) return 0;
        
        // const cartographics = positions.map(pos => CesiumJs.Cartographic.fromCartesian(pos));
        
        // let area = 0;
        // for (let i = 0; i < cartographics.length - 1; i++) {
        //     const j = (i + 1) % cartographics.length;
        //     area += cartographics[i].longitude * cartographics[j].latitude;
        //     area -= cartographics[j].longitude * cartographics[i].latitude;
        // }
        // area = Math.abs(area) / 2;
        
        // const earthRadius = 6371000;
        // area = area * earthRadius * earthRadius;
       
        
        // return area;
    // Reference point (first vertex)
        const origin = CesiumJs.Cartographic.fromCartesian(positions[0]);
        const ellipsoid = CesiumJs.Ellipsoid.WGS84;
        const originCart = ellipsoid.cartographicToCartesian(origin);

        // Transform to ENU local frame
        const transform = CesiumJs.Transforms.eastNorthUpToFixedFrame(originCart);
        const inverseTransform = CesiumJs.Matrix4.inverse(transform, new CesiumJs.Matrix4());

        // Convert all points to local ENU
        const localPoints = positions.map(pos => {
            return CesiumJs.Matrix4.multiplyByPoint(inverseTransform, pos, new CesiumJs.Cartesian3());
    });

    // Compute 2D polygon area (shoelace formula)
    let area = 0;
    for (let i = 0; i < localPoints.length; i++) {
        const j = (i + 1) % localPoints.length;
        area += localPoints[i].x * localPoints[j].y - localPoints[j].x * localPoints[i].y;
    }

    return Math.abs(area) * 0.5; // m²
    }, [CesiumJs]);

    // Add measurement label
    const addMeasurementLabel = React.useCallback((position: any, text: string, isTemp: boolean = false) => {
        if (!cesiumViewer.current) return null;
        
        const label = cesiumViewer.current.entities.add({
            position: position,
            label: {
                text: text,
                font: '14px sans-serif',
                fillColor: CesiumJs.Color.WHITE,
                outlineColor: CesiumJs.Color.BLACK,
                outlineWidth: 2,
                style: CesiumJs.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new CesiumJs.Cartesian2(0, -20),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                backgroundColor: CesiumJs.Color.BLACK.withAlpha(0.7),
                showBackground: true,
                backgroundPadding: new CesiumJs.Cartesian2(7, 5),
            }
        });
        
        if (isTemp) {
            measurementLabelsRef.current.push(label);
        }
        
        return label;
    }, [CesiumJs]);

    // Clear measurement labels
    const clearMeasurementLabels = React.useCallback(() => {
        measurementLabelsRef.current.forEach(label => {
            if (cesiumViewer.current) {
                cesiumViewer.current.entities.remove(label);
            }
        });
        measurementLabelsRef.current = [];
        setCurrentMeasurement(null);
    }, []);


    const cleanUpPrimitives = React.useCallback(() => {
        //On NextJS 13.4+, React Strict Mode is on by default.
        //The block below will remove all added primitives from the scene.
        addedScenePrimitives.current.forEach(scenePrimitive => {
            if (cesiumViewer.current !== null) {
                cesiumViewer.current.scene.primitives.remove(scenePrimitive);
            }
        });
        addedScenePrimitives.current = [];
    }, []);
//------------------------------    


    // function to get position from 3D tileset surface
    
    const getPositionFromTileset = React.useCallback((position: any, addOffset: boolean = true) => {
        if (!cesiumViewer.current) return null;
        
        cesiumViewer.current.scene.useDepthPicking = true;
        cesiumViewer.current.scene.pickTranslucentDepth = true;

        const pickedObject = cesiumViewer.current.scene.pick(position);
        let cartesian = null;
        
        if (CesiumJs.defined(pickedObject)) {
            // Check if we're picking on the 3D tileset
            const pickedPosition = cesiumViewer.current.scene.pickPosition(position);
            
            if (CesiumJs.defined(pickedPosition)) {
                cartesian = pickedPosition.clone();
                
                // Add a small offset above the surface for better visibility
                if (addOffset && cartesian) {
                    const cartographic = CesiumJs.Cartographic.fromCartesian(cartesian);
                    cartographic.height += 0.1; // Add 0.2 meters offset
                    cartesian = CesiumJs.Cartesian3.fromRadians(
                        cartographic.longitude,
                        cartographic.latitude,
                        cartographic.height
                    );
                }
                
                return cartesian;
            }
        }

        // If no tile picked, return null (don't fall back to terrain!)
        return null;

        // Fallback to globe pick
        // const ray = cesiumViewer.current.camera.getPickRay(position);
        // if (!ray) return null;
        
        // cartesian = cesiumViewer.current.scene.globe.pick(ray, cesiumViewer.current.scene);
        // return cartesian;
    }, [CesiumJs]);

    // Clear active drawing
    const clearActiveDrawing = React.useCallback(() => {
        if (activeShapeRef.current && cesiumViewer.current) {
            cesiumViewer.current.entities.remove(activeShapeRef.current);
            activeShapeRef.current = null;
        }
        
        activePointsRef.current.forEach(point => {
            if (cesiumViewer.current) {
                cesiumViewer.current.entities.remove(point);
            }
        });
        activePointsRef.current = [];
        clearMeasurementLabels();
    }, [clearMeasurementLabels]);

    // Stop drawing
    const stopDrawing = React.useCallback(() => {
        if (drawingHandlerRef.current) {
            drawingHandlerRef.current.destroy();
            drawingHandlerRef.current = null;
        }
        clearActiveDrawing();
        setCurrentDrawingMode('none');
    }, [clearActiveDrawing]);



    // Draw polyline
    // Draw polyline with better 3D tileset support
    const drawPolyline = React.useCallback(() => {
        if (!cesiumViewer.current) return;
        
        const handler = new CesiumJs.ScreenSpaceEventHandler(cesiumViewer.current.scene.canvas);
        drawingHandlerRef.current = handler;
        
        const positions: any[] = [];
        let dynamicPositions = new CesiumJs.CallbackProperty(() => {
            return positions;
        }, false);
        
        let polyline: Entity | null = null;
        let distanceLabel: Entity | null = null;
        
        handler.setInputAction((click: any) => {
            const cartesian = getPositionFromTileset(click.position);
            if (cartesian) {
                positions.push(cartesian);
                
                const point = cesiumViewer.current!.entities.add({
                    position: cartesian,
                    point: {
                        pixelSize: 5,
                        color: CesiumJs.Color.WHITE,
                        outlineColor: CesiumJs.Color.BLACK,
                        outlineWidth: 2,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
                });
                activePointsRef.current.push(point);
                
                if (positions.length === 1) {
                    // Create the polyline entity on first click
                    polyline = cesiumViewer.current!.entities.add({
                        polyline: {
                            positions: dynamicPositions,
                            width: 5,
                            material: new CesiumJs.PolylineGlowMaterialProperty({
                                glowPower: 0.2,
                                color: CesiumJs.Color.BLUE,
                            }),
                            // Important: Don't clamp to ground for 3D tilesets
                            arcType: CesiumJs.ArcType.NONE,
                            // This ensures the line is visible above the tileset
                            clampToGround: false,
                            //disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        }
                    });
                    activeShapeRef.current = polyline;
                }
                if (positions.length >= 2 && showMeasurements) {
                    if (distanceLabel) {
                        cesiumViewer.current!.entities.remove(distanceLabel);
                    }
                    
                    const distance = calculatePolylineDistance(positions);
                    const midPoint = positions[Math.floor(positions.length / 2)];
                    distanceLabel = addMeasurementLabel(
                        midPoint,
                        `Length: ${formatDistance(distance)}`,
                        true
                    );
                    
                    setCurrentMeasurement({
                        type: 'distance',
                        value: distance,
                        unit: 'meters',
                        formattedValue: formatDistance(distance)
                    });
                }
                
            }
        }, CesiumJs.ScreenSpaceEventType.LEFT_CLICK);
        
        // Mouse move handler for dynamic drawing
        handler.setInputAction((movement: any) => {
            if (positions.length > 0) {
                const cartesian = getPositionFromTileset(movement.endPosition);
                if (cartesian) {
                    // Update the dynamic positions for preview
                    if (dynamicPositions) {
                        dynamicPositions = new CesiumJs.CallbackProperty(() => {
                            return [...positions, cartesian];
                        }, false);
                        
                        if (polyline) {
                            (polyline.polyline as any).positions = dynamicPositions;
                        }
                    }
                }
            }
        }, CesiumJs.ScreenSpaceEventType.MOUSE_MOVE);
        
        handler.setInputAction(() => {
            if (polyline && positions.length >= 2) {
                // Finalize the polyline with static positions
                (polyline.polyline as any).positions = positions;

                if (showMeasurements) {
                    const distance = calculatePolylineDistance(positions);
                    const midPoint = positions[Math.floor(positions.length / 2)];
                    const finalLabel = addMeasurementLabel(
                        midPoint,
                        `Length: ${formatDistance(distance)}`,
                        false
                    );
                    
                    if (finalLabel) {
                        setDrawnEntities(prev => [...prev, polyline!, finalLabel]);
                    } else {
                        setDrawnEntities(prev => [...prev, polyline!]);
                    }
                } else {
                    setDrawnEntities(prev => [...prev, polyline!]);
                }
                activeShapeRef.current = null;
            }
            
            activePointsRef.current.forEach(point => {
                cesiumViewer.current!.entities.remove(point);
            });
            activePointsRef.current = [];
           
            
            stopDrawing();
        }, CesiumJs.ScreenSpaceEventType.RIGHT_CLICK);
    }, [CesiumJs, getPositionFromTileset, stopDrawing, 
        calculatePolylineDistance, showMeasurements, 
        addMeasurementLabel]);


    // Draw polygon
    // Draw polygon with better 3D tileset support
    const drawPolygon = React.useCallback(() => {
        if (!cesiumViewer.current) return;
        
        const handler = new CesiumJs.ScreenSpaceEventHandler(cesiumViewer.current.scene.canvas);
        drawingHandlerRef.current = handler;
        
        const  positions: any[] = [];
        let dynamicPositions = new CesiumJs.CallbackProperty(() => {
            return new CesiumJs.PolygonHierarchy(positions);
        }, false);
        
        let polygon: Entity | null = null;
        let areaLabel: Entity | null = null;
        
        handler.setInputAction((click: any) => {
            const cartesian = getPositionFromTileset(click.position);
            if (cartesian) {
                positions.push(cartesian);
                
                const point = cesiumViewer.current!.entities.add({
                    position: cartesian,
                    point: {
                        pixelSize: 5,
                        color: CesiumJs.Color.WHITE,
                        outlineColor: CesiumJs.Color.BLACK,
                        outlineWidth: 2,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
                });
                activePointsRef.current.push(point);
                
                if (positions.length === 3) {
                    // Create polygon on third click
                    polygon = cesiumViewer.current!.entities.add({
                        polygon: {
                            hierarchy: dynamicPositions,
                            material: CesiumJs.Color.RED.withAlpha(0.5),
                            outline: true,
                            outlineColor: CesiumJs.Color.RED,
                            outlineWidth: 3,
                           
                            arcType: CesiumJs.ArcType.NONE,
                            perPositionHeight: true,
                        }
                    });
                    activeShapeRef.current = polygon;
                }
                
                if (positions.length >= 3 && showMeasurements) {
                    if (areaLabel) {
                        cesiumViewer.current!.entities.remove(areaLabel);
                    }
                    
                    const area = calculatePolygonArea(positions);
                    console.log("Area: ", area)
                    const perimeter = calculatePolylineDistance([...positions, positions[0]]);
                    
                    const sumX = positions.reduce((sum, pos) => sum + pos.x, 0);
                    const sumY = positions.reduce((sum, pos) => sum + pos.y, 0);
                    const sumZ = positions.reduce((sum, pos) => sum + pos.z, 0);
                    const centroid = new CesiumJs.Cartesian3(
                        sumX / positions.length,
                        sumY / positions.length,
                        sumZ / positions.length
                    );
                    
                    areaLabel = addMeasurementLabel(
                        centroid,
                        `Area: ${formatArea(area)}\nPerimeter: ${formatDistance(perimeter)}`,
                        true
                    );
                    
                    setCurrentMeasurement({
                        type: 'area',
                        value: area,
                        unit: 'square meters',
                        formattedValue: formatArea(area)
                    });
                }
                
            }
        }, CesiumJs.ScreenSpaceEventType.LEFT_CLICK);
        
        // Mouse move for dynamic preview
        handler.setInputAction((movement: any) => {
            if (positions.length >= 3) {
                const cartesian = getPositionFromTileset(movement.endPosition);
                if (cartesian && polygon) {
                    dynamicPositions = new CesiumJs.CallbackProperty(() => {
                        return new CesiumJs.PolygonHierarchy([...positions, cartesian]);
                    }, false);
                    (polygon.polygon as any).hierarchy = dynamicPositions;
                }
            }
        }, CesiumJs.ScreenSpaceEventType.MOUSE_MOVE);
        
        handler.setInputAction(() => {
            if (polygon && positions.length >= 3) {
                // Finalize with static positions
                (polygon.polygon as any).hierarchy = new CesiumJs.PolygonHierarchy(positions);
                if (showMeasurements) {
                    const area = calculatePolygonArea(positions);
                    const perimeter = calculatePolylineDistance([...positions, positions[0]]);
                    
                    const sumX = positions.reduce((sum, pos) => sum + pos.x, 0);
                    const sumY = positions.reduce((sum, pos) => sum + pos.y, 0);
                    const sumZ = positions.reduce((sum, pos) => sum + pos.z, 0);
                    const centroid = new CesiumJs.Cartesian3(
                        sumX / positions.length,
                        sumY / positions.length,
                        sumZ / positions.length
                    );
                    
                    const finalLabel = addMeasurementLabel(
                        centroid,
                        `Area: ${formatArea(area)}\nPerimeter: ${formatDistance(perimeter)}`,
                        false
                    );
                    
                    if (finalLabel) {
                        setDrawnEntities(prev => [...prev, polygon!, finalLabel]);
                    } else {
                        setDrawnEntities(prev => [...prev, polygon!]);
                    }
                } else {
                    setDrawnEntities(prev => [...prev, polygon!]);
                }
                activeShapeRef.current = null;
            }
            
            activePointsRef.current.forEach(point => {
                cesiumViewer.current!.entities.remove(point);
            });
            activePointsRef.current = [];
        
            
            stopDrawing();
        }, CesiumJs.ScreenSpaceEventType.RIGHT_CLICK);
        }, [CesiumJs, getPositionFromTileset, stopDrawing, 
        calculatePolygonArea, calculatePolylineDistance, 
        showMeasurements, addMeasurementLabel]);


    // Handle drawing mode changes
    const handleDrawingModeChange = React.useCallback((mode: DrawingMode) => {
        // Stop current drawing
        stopDrawing();
        
        if (mode === 'none') return;
        
        setCurrentDrawingMode(mode);
        
        // Start new drawing mode
        switch (mode) {
            case 'polyline':
                drawPolyline();
                break;
            case 'polygon':
                drawPolygon();
                break;
        }
    }, [drawPolyline, drawPolygon, stopDrawing]);

    // Clear all drawings
    const clearAllDrawings = React.useCallback(() => {
        if (cesiumViewer.current) {
            drawnEntities.forEach(entity => {
                cesiumViewer.current!.entities.remove(entity);
            });
            setDrawnEntities([]);
            clearActiveDrawing();
        }
    }, [drawnEntities, clearActiveDrawing]);


//------------------------------------
    const initializeCesiumJs = React.useCallback(async () => {
        if (cesiumViewer.current !== null) {
            //Using the Sandcastle example below
            //https://sandcastle.cesium.com/?src=3D%20Tiles%20Feature%20Styling.html

            // eslint-disable-next-line react-hooks/exhaustive-deps

            //const osmBuildingsTileset = await CesiumJs.createOsmBuildingsAsync();
           
            //Clean up potentially already-existing primitives.
            cleanUpPrimitives();

            try {
 

                async function loadTileset() {
                                        // Add Cesium OSM Buildings.
                        //const buildingsTileset = await CesiumJs.createOsmBuildingsAsync();
                        //const osmBuildingsTilesetPrimitive=  cesiumViewer.current!.scene.primitives.add(buildingsTileset);
                        //addedScenePrimitives.current.push(osmBuildingsTilesetPrimitive);

                        const tileset = await CesiumJs.Cesium3DTileset.fromUrl(
                           tilesetUrl
                           //"/odm_textured_model_geo.obj"
                        );
                        currentTilesetRef.current = tileset;

                        const targetBuildingsTilesetPrimitive = cesiumViewer.current!.scene.primitives.add(tileset);
                        addedScenePrimitives.current.push(targetBuildingsTilesetPrimitive);
                        console.log('Tileset added');

                        await cesiumViewer.current!.zoomTo(tileset);

                    // Important settings for 3D tileset interaction
                        cesiumViewer.current!.scene.globe.depthTestAgainstTerrain = false;
                        cesiumViewer.current!.scene.logarithmicDepthBuffer = true;
                    
                    }

                await loadTileset()
           
            } catch (error) {
                console.error(`Error creating tileset: ${error}`);
            }



            //Adding tile and adding to addedScenePrimitives to keep track and delete in-case of a re-render.
            // const osmBuildingsTilesetPrimitive = cesiumViewer.current.scene.primitives.add(osmBuildingsTileset);
            // addedScenePrimitives.current.push(osmBuildingsTilesetPrimitive);
            
            //Position camera per Sandcastle demo
            //resetCamera();

            //We'll also add our own data here (In Philadelphia) passed down from props as an example
            // positions.forEach(p => {
            //     cesiumViewer.current?.entities.add({
            //         position: CesiumJs.Cartesian3.fromDegrees(p.lng, p.lat),
            //         ellipse: {
            //             semiMinorAxis: 50000.0,
            //             semiMajorAxis: 50000.0,
            //             height: 0,
            //             material: CesiumJs.Color.RED.withAlpha(0.5),
            //             outline: true,
            //             outlineColor: CesiumJs.Color.BLACK,
            //         }
            //     });
            // });

            //Set loaded flag
            setIsLoaded(true);

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }, [tilesetUrl, CesiumJs, cleanUpPrimitives]);

    React.useEffect( () => {
        if (cesiumViewer.current === null && cesiumContainerRef.current) {
            
            console.log("imageryViewModels ---- basemapsLayers : ",imageryViewModels);
            //OPTIONAL: Assign access Token here
            //Guide: https://cesium.com/learn/ion/cesium-ion-access-tokens/
            CesiumJs.Ion.defaultAccessToken =  ''//`${process.env.NEXT_PUBLIC_CESIUM_TOKEN}`;
           
            //NOTE: Always utilize CesiumJs; do not import them from "cesium"
            cesiumViewer.current = new CesiumJs.Viewer(cesiumContainerRef.current, {
                //Using the Sandcastle example below
                //https://sandcastle.cesium.com/?src=3D%20Tiles%20Feature%20Styling.html
                    //terrain: CesiumJs.Terrain.fromWorldTerrain(),
                    //terrainProvider: CesiumJs.createWorldTerrainAsync(),
                    //terrainProvider:   CesiumJs.createWorldTerrainAsync(),
                    imageryProviderViewModels: imageryViewModels,
                    selectedImageryProviderViewModel: imageryViewModels[0],
                    animation: false,
                    timeline: false,
                    infoBox: true,
                    homeButton: false,
                    fullscreenButton: false,
                    selectionIndicator: false,
       
                    orderIndependentTranslucency: false,
                    contextOptions: {
                        requestWebgl1: true,
                    },
            });
            // Remove the Terrain section of the baseLayerPicker
            cesiumViewer.current.baseLayerPicker.viewModel.terrainProviderViewModels= [] //.removeAll()
            //NOTE: Example of configuring a Cesium viewer
            cesiumViewer.current.clock.clockStep = CesiumJs.ClockStep.SYSTEM_CLOCK_MULTIPLIER;

            // Enable picking on 3D Tilesets
            cesiumViewer.current.scene.pick = cesiumViewer.current.scene.pick.bind(cesiumViewer.current.scene);
            cesiumViewer.current.scene.pickPosition = cesiumViewer.current.scene.pickPosition.bind(cesiumViewer.current.scene);
            

        }

        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [CesiumJs, imageryViewModels]);

    React.useEffect(() => {
        if (isLoaded) return;
        initializeCesiumJs();

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ isLoaded, initializeCesiumJs]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            stopDrawing();
            currentTilesetRef.current = null;
        };
    }, [stopDrawing]);

    //NOTE: Examples of typing... See above on "import type"
    const entities: Entity[] = [];
    //NOTE: Example of a function that utilizes CesiumJs features
    const julianDate = dateToJulianDate(CesiumJs, new Date());

  

    return (

        <div className="relative w-full h-full">

            <div
                ref={cesiumContainerRef}
                id='cesiumContainer'
                 className="w-full h-full"     
                //style={{ maxWidth: "88vw", maxHeight:"20vh" }}
                
            />	

            {/* Drawing Tools Toolbar  ${isMapFullscreen ? 'z-[100]' : 'z-20'}  */}
            <div className="absolute top-4 left-4 z-10 flex gap-2 p-2 bg-white rounded-lg shadow-md"
		        //style={{ position: 'absolute', zIndex: isMapFullscreen ? 100 : 20 }}	
                >
                <Button
                    onClick={() => handleDrawingModeChange('none')}
                    className={`p-2 ${currentDrawingMode === 'none' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    title="Select/Pan (Right-click to finish drawing)"
                    size="sm"
                    variant={currentDrawingMode === 'none' ? 'default' : 'outline'}
                    
                >
                    <Hand className="w-4 h-4 text-black" />
                </Button>
                
                <Button
                    onClick={() => handleDrawingModeChange('polyline')}
                    className={`p-2 ${currentDrawingMode === 'polyline' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    title="Draw Polyline (Right-click to finish)"
                    size="sm"
                    variant={currentDrawingMode === 'polyline' ? 'default' : 'outline'}
                    
                >
                    <Pencil className="w-4 h-4  text-black" />
                </Button>
                
                <Button
                    onClick={() => handleDrawingModeChange('polygon')}
                    className={`p-2 ${currentDrawingMode === 'polygon' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    title="Draw Polygon (Right-click to finish)"
                    size="sm"
                    variant={currentDrawingMode === 'polygon' ? 'default' : 'outline'}
                    
                >
                    <Square className="w-4 h-4  text-black" style={{ transform: 'rotate(45deg)' }} />
                </Button>
                
                
                <div className="border-l border-gray-300 mx-2" />
                
                <Button
                    onClick={clearAllDrawings}
                    className="p-2 bg-red-500 text-white hover:bg-red-600"
                    title="Clear All Drawings"
                    size="sm"
                    variant="destructive"
                    
                >
                    <Trash2 className="w-4 h-4  text-black" />
                </Button>
            </div>

            {/* Drawing Instructions */}
            {currentDrawingMode !== 'none' && (
                <div className="absolute top-20 left-4 z-10 bg-white p-2 rounded-lg shadow-md"
                     //style={{ position: 'absolute', zIndex: isMapFullscreen ? 50 : 20 }}
		>
                    <p className="text-sm text-gray-700">
                        {currentDrawingMode === 'polyline' && 'Click to add points, right-click to finish'}
                        {currentDrawingMode === 'polygon' && 'Click to add vertices, right-click to finish'}
                    </p>
                </div>
            )}

            {/* Custom Fullscreen Button */}
            {!isMapFullscreen && (
                <Button
                    onClick={onFullscreenToggle}
                    //className="absolute bottom-[-241] right-[170] z-20 p-2   shadow-md" 
                    className='absolute bottom-4 right-4 z-10 p-2 bg-white text-black rounded-full shadow-md hover:bg-gray-100'
                    title="Toggle Fullscreen"
                    size='default'
                    variant="default"
                    
                >
                <LucideFullscreen />
                </Button>
            )}
             {isMapFullscreen && (
                <button
                    onClick={onFullscreenToggle}
                    className="absolute bottom-4 right-4 z-10 p-2 bg-white text-black rounded-full shadow-md hover:bg-gray-100"
                    //style={{ position: 'absolute', zIndex: 150 }}
                    title="Exit Fullscreen"
                >
                    {/* Icon for exiting fullscreen */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9H19.5M15 9l5.25-5.25M15 15v4.5M15 15H19.5M15 15l5.25 5.25" />
                    </svg>
                </button>
            )}



        </div>
    )
}

export default CesiumComponent