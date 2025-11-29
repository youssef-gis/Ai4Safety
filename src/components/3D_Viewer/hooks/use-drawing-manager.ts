import React from 'react';
import { useRef, useState, useCallback } from 'react';
import { 
    Entity, 
    Viewer, 
    ScreenSpaceEventHandler, 
    ScreenSpaceEventType, 
    CallbackProperty, 
    PolygonHierarchy, 
    Cartesian3,
    PolylineGlowMaterialProperty,
    Color,
    ColorMaterialProperty,
    HeightReference,
    Cartesian2,
    LabelStyle,
    ConstantProperty,
    Cesium3DTileFeature
    // PolygonPipeline (use via CesiumJs.PolygonPipeline)
} from 'cesium';
import { CesiumType } from '../types/cesium';

export type DrawingMode = 'none' | 'point' | 'polyline' | 'polygon';

export interface DefectCandidate {
    positions: Cartesian3[];
    type: 'polyline' | 'polygon';
    measurement: string;
    labelPosition?: Cartesian3;
}

interface UseDrawingManagerProps {
    CesiumJs: CesiumType;
    viewer: Viewer | null;
    onShapeCreated: (candidate: DefectCandidate, entities: Entity[]) => void;
}

export const useDrawingManager = ({ CesiumJs, viewer, onShapeCreated }: UseDrawingManagerProps) => {
    const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
    
    const activeShapeRef = useRef<Entity | null>(null);
    const activePointsRef = useRef<Entity[]>([]);
    const drawingHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
    const floatingPointRef = useRef<Cartesian3 | null>(null); 
    const activeLabelRef = useRef<Entity | null>(null);

    // --- Math Helpers ---
    const calculatePolylineDistance = React.useCallback((positions: any[]): number => {
        let totalDistance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            totalDistance += CesiumJs.Cartesian3.distance(positions[i], positions[i + 1]);
        }
        return totalDistance;
    }, [CesiumJs]);

    const calculatePolygonArea =  React.useCallback((positions: any[]): number => {
        if (positions.length < 3) return 0;
        
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


    // --- Interaction Logic ---

    // ROBUST PICKING STRATEGY
    const getPositionFromTileset = useCallback((position: Cartesian2) => {
        if (!viewer) return null;
        const scene = viewer.scene;

        // First, ensure we really clicked a 3D tile / model
        const picked = scene.pick(position);
        if (
        !CesiumJs.defined(picked) ||
        !(
            picked instanceof CesiumJs.Cesium3DTileFeature ||
            picked.primitive instanceof CesiumJs.Cesium3DTileset
        )
        ) {
        // Click is not on the tileset – ignore
        return null;
        }


    // Method 1: Depth Buffer Pick (Best for 3D Tiles)
    const cartesian = scene.pickPosition(position);

    // Method 2: Ray Intersection (Fallback if Depth Pick fails)
    if (!CesiumJs.defined(cartesian)) {
         return null;
    }

    if (CesiumJs.defined(cartesian)) {
        // Apply offset ONLY if we are picking the base model
        // If we picked an existing drawing entity, we snap to it (no extra offset)
       // if (!isDrawingEntity) {
            const cartographic = CesiumJs.Cartographic.fromCartesian(cartesian);
            
            if (cartographic) {
                cartographic.height += 0.02; // 20cm offset to prevent Z-fighting with surface
                
                return CesiumJs.Cartesian3.fromRadians(
                    cartographic.longitude, 
                    cartographic.latitude, 
                    cartographic.height
                );
            }
        //} else {
            // We hit an entity, use the position as-is (effectively snapping to top of entity)
            //return cartesian; 
      //  }
   }
    return null;
}, [viewer, CesiumJs]);

    const clearActiveDrawing = useCallback(() => {
        if (!viewer) return;
        if (activeShapeRef.current) {
            viewer.entities.remove(activeShapeRef.current);
            activeShapeRef.current = null;
        }
        if (activeLabelRef.current) {
            viewer.entities.remove(activeLabelRef.current);
            activeLabelRef.current = null;
        }
        activePointsRef.current.forEach(p => viewer.entities.remove(p));
        activePointsRef.current = [];
        floatingPointRef.current = null;
    }, [viewer]);

    const stopDrawing = useCallback(() => {
        if (drawingHandlerRef.current) {
            drawingHandlerRef.current.destroy();
            drawingHandlerRef.current = null;
        }
        clearActiveDrawing();
        setDrawingMode('none');
    }, [clearActiveDrawing]);

    const createPoint = useCallback((position: Cartesian3) => {
        if (!viewer) return;
        const point = viewer.entities.add({
            position: position,
            point: {
                pixelSize: 8,
                color: CesiumJs.Color.WHITE,
                outlineColor: CesiumJs.Color.BLACK,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible on top
            }
        });
        activePointsRef.current.push(point);
    }, [CesiumJs, viewer]);

    const startDrawing = useCallback((mode: DrawingMode) => {
        if (!viewer) return;
        stopDrawing();
        setDrawingMode(mode);

        const handler = new CesiumJs.ScreenSpaceEventHandler(viewer.scene.canvas);
        drawingHandlerRef.current = handler;
        
        const positions: Cartesian3[] = [];

        // -- DYNAMIC GEOMETRY UPDATER --
        const dynamicPositions = new CesiumJs.CallbackProperty(() => {
            if (mode === 'polygon') {
                // If moving mouse, close the loop visually
                if (floatingPointRef.current) {
                    return new CesiumJs.PolygonHierarchy([...positions, floatingPointRef.current]);
                }
                return new CesiumJs.PolygonHierarchy(positions);
            }
            // Polyline
            if (floatingPointRef.current) {
                return [...positions, floatingPointRef.current];
            }
            return positions;
        }, false);

        // 1.  Add Vertex
        handler.setInputAction((click: any) => {
            const cartesian = getPositionFromTileset(click.position);
            if (!cartesian) return;

            // Check if this is the very first point
            if (positions.length === 0) {
                // Start tracking mouse movement
                floatingPointRef.current = cartesian.clone();
                
                // Create the Dynamic Shape Entity
                if (mode === 'polyline') {
                    activeShapeRef.current = viewer.entities.add({
                        polyline: {
                            positions: dynamicPositions,
                            width: 5,
                            material: new PolylineGlowMaterialProperty({
                                glowPower: 0.2,
                                color: CesiumJs.Color.BLUE,
                            }),
                            clampToGround: false,
                            arcType: CesiumJs.ArcType.NONE, 
                        }
                    });
                } else if (mode === 'polygon') {
                    activeShapeRef.current = viewer.entities.add({
                        polygon: {
                            hierarchy: dynamicPositions as any,
                            material: new ColorMaterialProperty(CesiumJs.Color.RED.withAlpha(0.5)),
                            perPositionHeight: true, // Vital for 3D Tiles
                            outline: true,
                            outlineColor: CesiumJs.Color.BLACK,
                        }
                    });
                }

                // Create a Dynamic Label
                activeLabelRef.current = viewer.entities.add({
                    position: new CesiumJs.CallbackProperty(() => {
                        return floatingPointRef.current || positions[positions.length - 1];
                    }, false) as unknown as Cartesian3,
                    label: {
                        text: new CesiumJs.CallbackProperty(() => {
                            // CALCULATE METRICS LIVE
                            const currentPos = floatingPointRef.current;
                            if(!currentPos) return "Start";
                            
                            const livePositions = [...positions, currentPos];
                            
                            if (mode === 'polyline') {
                                const d = calculatePolylineDistance(livePositions);
                                return `Length: ${formatDistance(d)}`;
                            }
                            if (mode === 'polygon' && livePositions.length > 2) {
                                const a = calculatePolygonArea([...livePositions, positions[0]]); // Close loop
                                return `Area: ${formatArea(a)}`;
                            }
                            return "Draw...";
                        }, false) as unknown as string,
                        font: '14px sans-serif',
                        fillColor: CesiumJs.Color.WHITE,
                        showBackground: true,
                        backgroundColor: CesiumJs.Color.BLACK.withAlpha(0.7),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        pixelOffset: new Cartesian2(10, -10)
                    }
                });
            }

            positions.push(cartesian);
            createPoint(cartesian);

        }, CesiumJs.ScreenSpaceEventType.LEFT_CLICK);

        //  MOUSE MOVE: Update Floating Point

        handler.setInputAction((movement: any) => {
            const cartesian = getPositionFromTileset(movement.endPosition);
            if (cartesian) {
                floatingPointRef.current = cartesian;
            }
        }, CesiumJs.ScreenSpaceEventType.MOUSE_MOVE);

        //  RIGHT CLICK: Finish & Commit
        handler.setInputAction(() => {
            // Need at least 2 points for line, 3 for polygon
            const minPoints = mode === 'polygon' ? 3 : 2;
            if (positions.length < minPoints) {
                // Cancel if not enough points
                stopDrawing();
                return;
            }

            const finalShape = activeShapeRef.current;
            if(!finalShape) return;

            // 1. Freeze Geometry (remove CallbackProperty)
            if (mode === 'polyline') {
                (finalShape.polyline as any).positions = [...positions];
                (finalShape.polyline as any).arcType = CesiumJs.ArcType.NONE;
            } else if (mode === 'polygon') {
                (finalShape.polygon as any).hierarchy = new PolygonHierarchy([...positions]);
                (finalShape.polygon as any).perPositionHeight = true;
            }

            // 2. Freeze Label (remove CallbackProperty)
            let labelText = "";
            if (mode === 'polyline') {
                labelText = `Length: ${formatDistance(calculatePolylineDistance(positions))}`;
            } else {
                labelText = `Area: ${formatArea(calculatePolygonArea(positions))}`;
            }

            // We create a NEW static label at the center/end
            const labelPos = positions[positions.length - 1]; // Or compute centroid
            const finalLabel = viewer.entities.add({
                position: labelPos,
                label: {
                    text: labelText,
                    font: '14px sans-serif',
                    fillColor: CesiumJs.Color.WHITE,
                    showBackground: true,
                    backgroundColor: CesiumJs.Color.BLACK.withAlpha(0.7),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    pixelOffset: new Cartesian2(0, -20)
                }
            });

            // Clean up dynamic helpers
            if(activeLabelRef.current) viewer.entities.remove(activeLabelRef.current);
            activePointsRef.current.forEach(p => viewer.entities.remove(p)); 
        

            const entities = [finalShape, finalLabel];

            // Hand off to Parent
            onShapeCreated({
                positions: [...positions],
                type: mode as 'polyline' | 'polygon',
                measurement: labelText,
                labelPosition: labelPos
            }, entities);

            // Reset local state
            activeShapeRef.current = null;
            activeLabelRef.current = null;
            activePointsRef.current = [];
            if (drawingHandlerRef.current) {
                drawingHandlerRef.current.destroy();
                drawingHandlerRef.current = null;
            }
            setDrawingMode('none');

        }, CesiumJs.ScreenSpaceEventType.RIGHT_CLICK);

    }, [viewer, stopDrawing, CesiumJs.ScreenSpaceEventHandler, CesiumJs.CallbackProperty, CesiumJs.ScreenSpaceEventType.LEFT_CLICK, CesiumJs.ScreenSpaceEventType.MOUSE_MOVE, CesiumJs.ScreenSpaceEventType.RIGHT_CLICK, CesiumJs.PolygonHierarchy, CesiumJs.Color.WHITE, CesiumJs.Color.BLACK, CesiumJs.Color.BLUE, CesiumJs.Color.RED, getPositionFromTileset, createPoint, calculatePolylineDistance, calculatePolygonArea, onShapeCreated]);

    return {
        drawingMode,
        startDrawing,
        stopDrawing,
        clearActiveDrawing
    };
};