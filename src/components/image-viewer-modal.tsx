'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { X, Pencil, Undo2, Move, ZoomIn, ZoomOut, Bug } from 'lucide-react';

// --- EXIF HELPER ---
async function getExifRotation(url: string): Promise<number> {
    try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const view = new DataView(buf);
        let offset = 2;
        while (offset < view.byteLength) {
            if (view.getUint16(offset) === 0xFFE1) {
                const exifStart = offset + 4;
                const little = view.getUint16(exifStart + 6, false) === 0x4949;
                const orientation = view.getUint16(exifStart + 18, little);
                switch (orientation) {
                    case 3: return 180;
                    case 6: return 90;
                    case 8: return -90;
                    default: return 0;
                }
            }
            offset += 2 + view.getUint16(offset + 2);
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

interface ImageViewerModalProps {
    src: string;
    onClose: () => void;
    onSaveDrawing: (points: {x: number, y: number}[]) => void;
    expectedWidth?: number;
    expectedHeight?: number;
}

export const ImageViewerModal = ({
    src,
    onClose,
    onSaveDrawing,
    expectedWidth,
    expectedHeight
}: ImageViewerModalProps) => {
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    
    const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const currentPath = useRef<{ x: number; y: number }[]>([]);

    useEffect(() => {
        getExifRotation(src).then(setRotation);
    }, [src]);

    const handleImageLoad = useCallback(() => {
        if (imgRef.current) {
            const { naturalWidth, naturalHeight } = imgRef.current;
            setImageDimensions({ width: naturalWidth, height: naturalHeight });
            setImageLoaded(true);
            
            if (canvasRef.current) {
                canvasRef.current.width = naturalWidth;
                canvasRef.current.height = naturalHeight;
            }
        }
    }, []);

    // --- CANVAS RENDERING ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageLoaded) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Style
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = "#ff0000";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 2;

        paths.forEach(path => {
            if (path.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            path.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });

        // Current path (live preview)
        if (currentPath.current.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentPath.current[0].x, currentPath.current[0].y);
            currentPath.current.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }

        // Debug markers
        if (debugMode) {
            ctx.font = '40px Arial';
            ctx.fillStyle = 'lime';
            ctx.fillText(`TOP-LEFT`, 20, 50);
            ctx.fillText(`BOTTOM-RIGHT`, canvas.width - 300, canvas.height - 20);
        }
    }, [paths, imageLoaded, debugMode, currentPath.current]); // Added currentPath dep

    // --- PAN/ZOOM LOGIC ---
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isDrawing) return;
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current || isDrawing) return;
        e.preventDefault();
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = -e.deltaY * 0.001;
        setScale(s => Math.min(Math.max(0.1, s + delta), 10));
    };

    // --- RELIABLE COORDINATE MAPPING ---
    // Maps screen click -> Natural Image Coordinates
    const getImgCoords = useCallback((e: React.PointerEvent): { x: number; y: number } => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Position relative to the visible element
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Scaling factor between CSS pixels and Internal Canvas (Natural) pixels
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: clientX * scaleX,
            y: clientY * scaleY
        };
    }, []);

    // --- DRAWING LOGIC ---
    const startDraw = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);

        const p = getImgCoords(e);
        currentPath.current = [p];
        
        // Force render for live preview
        const canvas = canvasRef.current;
        if(canvas) {
             const ctx = canvas.getContext('2d');
             if(ctx) {
                 ctx.beginPath();
                 ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                 ctx.fill();
             }
        }
    };

    const moveDraw = (e: React.PointerEvent) => {
        if (!isDrawing || currentPath.current.length === 0) return;
        e.stopPropagation();

        const p = getImgCoords(e);
        currentPath.current.push(p);

        // Optional: Throttle re-renders here if performance is bad
        // For now, we manually trigger a quick redraw without state update for performance
        const canvas = canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                const prev = currentPath.current[currentPath.current.length-2];
                ctx.lineWidth = 5;
                ctx.strokeStyle = "#ff0000";
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
    };

    const endDraw = (e: React.PointerEvent) => {
        if (!isDrawing || currentPath.current.length === 0) return;
        e.currentTarget.releasePointerCapture(e.pointerId);

        const finalPath = [...currentPath.current];
        
        // Validate
        const validPoints = finalPath.filter(p => 
            p.x >= 0 && p.x <= imageDimensions.width &&
            p.y >= 0 && p.y <= imageDimensions.height
        );

        if (validPoints.length > 1) {
            // Decimate points (simplify)
            // Take every Nth point to avoid sending thousands of pixels
            const density = 5; 
            const simplified = validPoints.filter((_, i) => i % density === 0 || i === validPoints.length - 1);
            
            setPaths(prev => [...prev, simplified]);
            onSaveDrawing(simplified);
            console.log("📤 Sending points to Cesium:", simplified.length);
        }

        currentPath.current = [];
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center overflow-hidden"
            onPointerUp={handlePointerUp}
        >
            {/* TOOLBAR */}
            <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-black/50 p-2 rounded-lg border border-white/10 backdrop-blur-md">
                <Button
                    size="icon"
                    onClick={() => setIsDrawing(!isDrawing)}
                    variant={isDrawing ? "default" : "secondary"}
                >
                    {isDrawing ? <Pencil className="w-4 h-4 text-white" /> : <Move className="w-4 h-4" />}
                </Button>
                <Button
                    size="icon"
                    onClick={() => setPaths(p => p.slice(0, -1))}
                    variant="secondary"
                    disabled={paths.length === 0}
                >
                    <Undo2 className="w-4 h-4" />
                </Button>
                <div className="h-px bg-white/20 my-1" />
                <Button size="icon" onClick={() => setScale(s => Math.min(10, s + 0.5))} variant="secondary">
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={() => setScale(s => Math.max(0.1, s - 0.5))} variant="secondary">
                    <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                    size="icon"
                    onClick={() => setDebugMode(!debugMode)}
                    variant={debugMode ? "default" : "secondary"}
                >
                    <Bug className="w-4 h-4" />
                </Button>
            </div>

            <Button
                size="icon"
                className="absolute top-4 right-4 z-50 rounded-full bg-white/10"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
            </Button>

            {/* VIEWPORT */}
            <div
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onWheel={handleWheel}
                style={{ cursor: isDrawing ? 'crosshair' : isDragging.current ? 'grabbing' : 'grab' }}
            >
                <div
                    ref={contentWrapperRef}
                    className="relative shadow-2xl"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
                        transition: isDragging.current ? 'none' : 'transform 0.1s ease-out',
                        transformOrigin: 'center',
                        userSelect: 'none'
                    }}
                >
                    <img
                        ref={imgRef}
                        src={src}
                        alt="Inspection"
                        className="max-h-[85vh] max-w-[90vw] object-contain pointer-events-none"
                        draggable={false}
                        onLoad={handleImageLoad}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full touch-none"
                        style={{ pointerEvents: isDrawing ? 'auto' : 'none' }}
                        onPointerDown={startDraw}
                        onPointerMove={moveDraw}
                        onPointerUp={endDraw}
                    />
                </div>
            </div>
        </div>
    );
};