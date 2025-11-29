'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react';
import { CesiumType } from './types/cesium';
import { Detection } from '@prisma/client';
import { type Entity } from 'cesium';
import { DefectCandidate } from './hooks/use-drawing-manager';

// Define props for the Dynamic Component
export interface CesiumComponentProps {
    CesiumJs: CesiumType;
    cesiumContainerRef: React.RefObject<HTMLDivElement | null> ;
    onFullscreenToggle?: () => void;
    isMapFullscreen?: boolean;
    tilesetUrl: string;
    inspectionId: string;
    initialDetections: Detection[];
    // Event Handlers
    onDefectDetected?: (candidate: DefectCandidate, tempEntities: Entity[]) => void;
    onDefectSelected?: (defect: Detection) => void;
    focusedDefectId?: string | null;
}

const CesiumDynamicComponent = dynamic(() => import('./Cesium'), {
    ssr: false
});

type WrapperProps = {
  tilesetUrl: string;
  inspectionId: string;
  initialDetections: Detection[];
  // Parent Listeners
  onDefectDetected?: (candidate: DefectCandidate, tempEntities: Entity[]) => void;
  onDefectSelected?: (defect: Detection) => void;
  focusedDefectId?: string | null;
  children?: React.ReactNode; 
};

export const CesiumWrapper: React.FunctionComponent<WrapperProps> = ({
    tilesetUrl, 
    inspectionId, 
    initialDetections,
    onDefectDetected,
    onDefectSelected,
    focusedDefectId,
    children
}) => {
    const [CesiumJs, setCesiumJs] = useState<CesiumType | null>(null);
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const cesiumContainerRef = useRef<HTMLDivElement>(null); 
    const fullscreenWrapperRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (CesiumJs !== null) return
        const CesiumImportPromise = import('cesium');
        Promise.all([CesiumImportPromise]).then((promiseResults) => {
            const { ...Cesium } = promiseResults[0];
            setCesiumJs(Cesium);
        });
    }, [CesiumJs]);

    const handleFullscreenToggle = () => {
        if (fullscreenWrapperRef.current) {
            if (!document.fullscreenElement) {
                fullscreenWrapperRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsMapFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={fullscreenWrapperRef} className="relative w-full h-full bg-black">
            {CesiumJs ? (
                    <CesiumDynamicComponent
                        CesiumJs={CesiumJs}
                        cesiumContainerRef={cesiumContainerRef}
                        onFullscreenToggle={handleFullscreenToggle} 
                        isMapFullscreen={isMapFullscreen} 
                        tilesetUrl={tilesetUrl}
                        inspectionId={inspectionId}
                        initialDetections={initialDetections}
                        // Pass new handlers down
                        onDefectDetected={onDefectDetected}
                        onDefectSelected={onDefectSelected}
                        focusedDefectId= {focusedDefectId}
                    />
            ) : null}
            {children}
        </div>
    );
};

export default CesiumWrapper;