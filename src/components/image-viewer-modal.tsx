'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { X, Pencil, ZoomIn, ZoomOut, Save, AlertTriangle, MousePointer2, Activity, Hexagon, Square, Undo } from 'lucide-react';
import { Cartesian3, Matrix4, Matrix3, Quaternion } from 'cesium';

// --- Types ---
type ToolType = 'none' | 'rectangle' | 'polygon' | 'polyline';

interface Point { x: number; y: number; }

interface Shape {
    type: ToolType;
    points: Point[];
}

function projectWorldToImage(
    worldPosition: { x: number, y: number, z: number },
    cameraPose: { position: Cartesian3, orientation: Quaternion },
    intrinsics: { width: number, height: number, focal: number }
) {
    const pointWS = new Cartesian3(worldPosition.x, worldPosition.y, worldPosition.z);
    const viewMatrix = Matrix4.fromRotationTranslation(
        Matrix3.fromQuaternion(cameraPose.orientation),
        cameraPose.position
    );
    const inverseView = Matrix4.inverse(viewMatrix, new Matrix4());
    const pointCamera = Matrix4.multiplyByPoint(inverseView, pointWS, new Cartesian3());

    if (pointCamera.z > 0) return null; 

    const effectiveFocal = intrinsics.focal > 0 ? intrinsics.focal : (intrinsics.width * 0.85); 
    const u = (pointCamera.x / -pointCamera.z) * effectiveFocal;
    const v = (pointCamera.y / -pointCamera.z) * effectiveFocal;

    const xPixel = (intrinsics.width / 2) + u;
    const yPixel = (intrinsics.height / 2) - v; 

    if (xPixel < 0 || xPixel > intrinsics.width || yPixel < 0 || yPixel > intrinsics.height) {
        return null;
    }
    return { x: xPixel, y: yPixel };
}

interface CameraContext {
    position: { x: number, y: number, z: number }; 
    orientation: { x: number, y: number, z: number, w: number }; 
    intrinsics: { width: number, height: number, focal: number };
}

interface ImageViewerModalProps {
    src: string;
    onClose: () => void;
    onSave: (drawingData: { points: Point[], imageId: string | null, defectId?: string | null, type: string }) => void;
    imageId: string | null;
    cameraContext?: CameraContext;
    nearbyDefects?: any[]; 
    initialData?: { 
        id: string; 
        points: Point[];
        type?: string; 
    };
}

export const ImageViewerModal = ({
    src,
    onClose,
    onSave,
    imageId,
    cameraContext,
    nearbyDefects = [],
    initialData
}: ImageViewerModalProps) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    //const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);

    // Drawing State
    const [activeTool, setActiveTool] = useState<ToolType>('none');
    
    // Determine initial shape based on data
    const [savedShape, setSavedShape] = useState<Shape | null>(() => {
        if (initialData?.points && initialData.points.length > 0) {
            // Infer type if not provided: 3+ points = polygon, 2 = polyline, unless explicitly defined
            const inferredType = initialData.points.length > 2 ? 'polygon' : 'polyline';
            return { 
                type: (initialData.type as ToolType) || inferredType, 
                points: initialData.points 
            };
        }
        return null;
    });
    
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]); 
    const [cursorPos, setCursorPos] = useState<Point | null>(null); // For elastic line preview

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const currentPath = useRef<{ x: number; y: number }[]>([]);
    const [paths, setPaths] = useState<{ x: number; y: number }[][]>(() => {
        if (initialData?.points && initialData.points.length > 0) {
            return [initialData.points];
        }
        return [];
    });

    const ghostMarkers = useMemo(() => {
        if (!cameraContext || !nearbyDefects.length) return [];

        const pose = {
            position: new Cartesian3(cameraContext.position.x, cameraContext.position.y, cameraContext.position.z),
            orientation: new Quaternion(cameraContext.orientation.x, cameraContext.orientation.y, cameraContext.orientation.z, cameraContext.orientation.w)
        };

        return nearbyDefects.map(defect => {
            let loc = null;
            if (defect.locationOn3dModel?.coordinates?.length > 0) {
                loc = defect.locationOn3dModel.coordinates[0];
            }
            if (!loc) return null;
            const pixel = projectWorldToImage(loc, pose, cameraContext.intrinsics);
            if (!pixel) return null;
            return {
                ...defect,
                pixelX: pixel.x,
                pixelY: pixel.y
            };
        }).filter(Boolean); 
    }, [nearbyDefects, cameraContext]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageLoaded) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 2;
        ctx.lineWidth = 5;

        // Helper to draw a specific shape
        const drawShape = (points: Point[], type: ToolType, isPreview = false) => {
            if (points.length < 1) return;

            ctx.beginPath();
            ctx.lineWidth = 4 / scale; // Keep line thickness constant visually
            ctx.strokeStyle = isPreview ? "#3b82f6" : "#ef4444"; // Blue for preview, Red for saved
            ctx.fillStyle = isPreview ? "rgba(59, 130, 246, 0.2)" : "rgba(239, 68, 68, 0.2)";

            if (type === 'rectangle') {
                const start = points[0];
                const end = points[1] || (isPreview ? cursorPos : start); 
                if(!end) return;
                const w = end.x - start.x;
                const h = end.y - start.y;
                ctx.rect(start.x, start.y, w, h);
                ctx.stroke();
                ctx.fill();
            } 
            else if (type === 'polyline' || type === 'polygon') {
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(p => ctx.lineTo(p.x, p.y));

                // Rubber-banding: Line to cursor
                if (isPreview && cursorPos && activeTool !== 'none') {
                    ctx.lineTo(cursorPos.x, cursorPos.y);
                }

                // Close path for polygons
                if (type === 'polygon' && (!isPreview || points.length > 2)) {
                    ctx.closePath();
                    ctx.fill();
                }
                
                ctx.stroke();

                // Draw vertices dots for better editing feel
                if (isPreview) {
                    ctx.fillStyle = "#fff";
                    points.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 4 / scale, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    });
                }
            }
        };

        // 1. Draw Nearby Defects (Ghost Markers)
       

        // 2. Draw Saved Shape
        if (savedShape) {
            drawShape(savedShape.points, savedShape.type, false);
        }

        // 3. Draw WIP Shape
        if (currentPoints.length > 0) {
            drawShape(currentPoints, activeTool, true);
        }

        // 2. Draw SAVED Drawings (From Database)
        // We filter defects that match this specific image
        nearbyDefects.forEach(defect => {
            
            if (defect.sourceImageId === imageId && Array.isArray(defect.annotation2D)) {
                const points = defect.annotation2D as {x: number, y: number}[];
                
                if (points.length < 2) return;

                // Draw in a different color (e.g., Darker Red or Orange) to distinguish saved vs new
                ctx.strokeStyle = "#b91c1c"; // Dark Red
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach((p) => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            }
        });
        paths.forEach(path => {
            if (path.length < 2) return;
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#ef4444"; 
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });
    }, [paths, imageLoaded, nearbyDefects, imageId, savedShape, currentPoints, scale, cursorPos, activeTool]);

    const getImgCoords = (e: React.PointerEvent | React.MouseEvent) => { 
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };


    const handlePointerDown = (e: React.PointerEvent) => {
        if (activeTool === 'none') {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId); // Capture mouse for dragging out of bounds
        const p = getImgCoords(e);

        if (activeTool === 'rectangle') {
            // Start rect
            if (currentPoints.length === 0) {
                setCurrentPoints([p]); 
            }
        } else {
            // Polyline / Polygon: Add vertex
            // If clicking near the start point for Polygon, close it?
            if (activeTool === 'polygon' && currentPoints.length > 2) {
                const start = currentPoints[0];
                const dist = Math.hypot(p.x - start.x, p.y - start.y);
                if (dist < (20 / scale)) {
                    // Clicked start point -> Finish
                    setSavedShape({ type: 'polygon', points: currentPoints });
                    setCurrentPoints([]);
                    return;
                }
            }
            setCurrentPoints(prev => [...prev, p]);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        // Pan Logic
        if (activeTool === 'none' && isDragging.current) {
            e.preventDefault();
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        const p = getImgCoords(e);
        setCursorPos(p); // Update cursor for rubber-banding

        // Rectangle Drag Logic
        if (activeTool === 'rectangle' && currentPoints.length === 1) {
            // We only store Start and Current here. 
            // In render, we assume points[1] is the cursor/current drag
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (activeTool === 'none') {
            isDragging.current = false;
            return;
        }

        if (activeTool === 'rectangle' && currentPoints.length === 1) {
            const p = getImgCoords(e);
            // Finish rectangle
            setSavedShape({ type: 'rectangle', points: [currentPoints[0], p] });
            setCurrentPoints([]);
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    // Double click to finish Polyline/Polygon
    const handleDoubleClick = (e: React.MouseEvent) => {
        if ((activeTool === 'polyline' || activeTool === 'polygon') && currentPoints.length > 1) {
            setSavedShape({ type: activeTool, points: currentPoints });
            setCurrentPoints([]);
        }
    };

    const handleUndo = () => {
        if (currentPoints.length > 0) {
            // Remove last point of WIP shape
            setCurrentPoints(prev => prev.slice(0, -1));
        } else if (savedShape) {
            // Remove saved shape
            setSavedShape(null);
        }
    };

    const handleSave = () => {
        if (!savedShape) {
            alert("Please draw a defect first.");
            return;
        }
        
        // Flatten logic or shape logic depending on backend.
        // For Rectangle, convert [start, end] to 4 points if needed, or keep as 2.
        // Here we pass strictly what we drew.
        onSave({ 
            points: savedShape.points, 
            imageId,
            defectId: initialData?.id,
            type: savedShape.type 
        });
        
        setActiveTool('none');
    };
return (
        <div className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center overflow-hidden" 
            onPointerUp={() => isDragging.current = false}>
            
            {/* --- TOOLBAR --- */}
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-black/80 p-2 rounded-lg border border-white/10 backdrop-blur-md shadow-xl">
                <span className="text-[10px] text-white/50 text-center font-mono uppercase tracking-wider mb-1">Tools</span>
                
                {/* Pan Tool */}
                <Button size="icon" onClick={() => { setActiveTool('none'); setCurrentPoints([]); }} 
                    variant={activeTool === 'none' ? "default" : "secondary"} className="h-8 w-8" title="Pan">
                    <MousePointer2 className="w-4 h-4" />
                </Button>
                
                <div className="h-px bg-white/20 my-1" />
                
                {/* Drawing Tools */}
                <Button size="icon" onClick={() => { setActiveTool('polyline'); setCurrentPoints([]); setSavedShape(null); }} 
                    variant={activeTool === 'polyline' ? "default" : "secondary"} className="h-8 w-8" title="Polyline">
                    <Activity className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={() => { setActiveTool('polygon'); setCurrentPoints([]); setSavedShape(null); }} 
                    variant={activeTool === 'polygon' ? "default" : "secondary"} className="h-8 w-8" title="Polygon">
                    <Hexagon className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={() => { setActiveTool('rectangle'); setCurrentPoints([]); setSavedShape(null); }} 
                    variant={activeTool === 'rectangle' ? "default" : "secondary"} className="h-8 w-8" title="Rectangle">
                    <Square className="w-4 h-4" />
                </Button>

                <div className="h-px bg-white/20 my-1" />
                
                <Button size="icon" onClick={handleUndo} variant="destructive" className="h-8 w-8 bg-red-900/50 hover:bg-red-900" title="Undo">
                    <Undo className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={() => setScale(s => Math.min(5, s + 0.5))} variant="secondary" className="h-8 w-8"><ZoomIn className="w-4 h-4" /></Button>
                <Button size="icon" onClick={() => setScale(s => Math.max(0.1, s - 0.5))} variant="secondary" className="h-8 w-8"><ZoomOut className="w-4 h-4" /></Button>
            </div>

            {/* Save Button */}
            {savedShape && (
                <div className="absolute top-4 left-24 z-50 ml-4">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg">
                        <Save className="w-4 h-4" />
                        Save Defect
                    </Button>
                </div>
            )}

            {/* Close Button */}
            <Button size="icon" className="absolute top-4 right-4 z-50 rounded-full bg-white/10 hover:bg-white/20" onClick={onClose}>
                <X className="w-6 h-6" />
            </Button>

            {/* Canvas Area */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden" 
                style={{ cursor: activeTool === 'none' ? (isDragging.current ? 'grabbing' : 'grab') : 'crosshair' }}>
                <div className="relative shadow-2xl transition-transform duration-75 ease-out" 
                    style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}>
                    
                    <img ref={imgRef} src={src} 
                        className="max-h-[85vh] max-w-[90vw] object-contain pointer-events-none select-none" 
                        onLoad={(e) => {
                            setImageLoaded(true);
                            if(canvasRef.current) {
                                canvasRef.current.width = e.currentTarget.naturalWidth;
                                canvasRef.current.height = e.currentTarget.naturalHeight;
                            }
                        }}
                    />
                    
                    <canvas ref={canvasRef} 
                        className="absolute top-0 left-0 w-full h-full" 
                        style={{ pointerEvents: 'auto' }} 
                        onPointerDown={handlePointerDown} 
                        onPointerMove={handlePointerMove} 
                        onPointerUp={handlePointerUp}
                        onDoubleClick={handleDoubleClick}
                    />
                    
               
                    {imageLoaded && ghostMarkers.map((marker, i) => (
                        <div key={marker.id || i} className="absolute flex items-center justify-center group cursor-pointer z-20" style={{ left: marker.pixelX, top: marker.pixelY, transform: 'translate(-50%, -50%)' }} onClick={(e) => { e.stopPropagation(); alert(`Existing defect #${marker.id.substring(0,8)} found here.`); }}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75" />
                                <div className="relative w-8 h-8 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-4 h-4 text-black" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Instructions Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 text-sm bg-black/60 px-6 py-2 rounded-full backdrop-blur pointer-events-none border border-white/10">
                {activeTool === 'none' && "Pan and zoom to inspect."}
                {activeTool === 'rectangle' && "Click and drag to box a defect."}
                {activeTool === 'polyline' && "Click to add points. Double-click to finish."}
                {activeTool === 'polygon' && "Click to add points. Double-click or click start to close."}
            </div>
        </div>
    );
};