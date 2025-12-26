'use client';

if (typeof window !== "undefined") {
            (window as any).CESIUM_BASE_URL = "/cesium";
        }


import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react';
import { CesiumType } from './types/cesium';
import { Detection } from '@prisma/client';
//import { type Entity } from 'cesium';
import { DefectCandidate } from './hooks/use-drawing-manager';
import { Spinner } from '../spinner';
import { SeverityVisibility } from './components/layer-control'; 
import { MapLayer } from './types/map';

// Define props for the Dynamic Component
type CesiumEntity = any;
export interface CesiumComponentProps {
    CesiumJs: CesiumType;
    cesiumContainerRef: React.RefObject<HTMLDivElement | null> ;
    onFullscreenToggle?: () => void;
    isMapFullscreen?: boolean;
    proxyBaseUrl:string;
    camerasUrl: string;
    tilesetUrl: string;
    inspectionId: string;
    initialDetections: Detection[];

    // Event Handlers

    onDefectDetected?: (candidate: DefectCandidate, tempEntities: CesiumEntity[]) => void;
    onDefectSelected?: (defect: Detection) => void;
    focusedDefectId?: string | null;
    showTileset: boolean;
    onToggleTileset: () => void;
    
    severityVisibility: SeverityVisibility;
    onToggleSeverity: (key: keyof SeverityVisibility) => void;
    onToggleAllDefects: (show: boolean) => void;
    layers: MapLayer[];
    defectToEditImage: Detection | null;
    onCloseImageEdit: () => void;
}


const CesiumDynamicComponent = dynamic(() => import('./Cesium'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-slate-950">
            <div className="text-white text-center">
                <Spinner />
                <p className="mt-4 text-sm text-slate-400">Initializing 3D Engine...</p>
            </div>
        </div>
    )
});

type WrapperProps = {
 proxyBaseUrl:string;
  camerasUrl:string;
  tilesetUrl: string;
  layers: MapLayer[];
  inspectionId: string;
  initialDetections: Detection[];
  // Parent Listeners
  onDefectDetected?: (candidate: DefectCandidate, tempEntities: CesiumEntity[]) => void;
  onDefectSelected?: (defect: Detection) => void;
  focusedDefectId?: string | null;
  showTileset: boolean;
  showDefects: boolean;
  onToggleTileset: () => void;
  onToggleDefects: () => void;
  defectToEditImage: Detection | null; 
  onCloseImageEdit: () => void;
  children?: React.ReactNode; 
};

export const CesiumWrapper: React.FunctionComponent<WrapperProps> = ({
    proxyBaseUrl,
    camerasUrl,
    tilesetUrl, 
    layers,
    inspectionId, 
    initialDetections,
    onDefectDetected,
    onDefectSelected,
    focusedDefectId,
    defectToEditImage,
    onCloseImageEdit,
    children
}) => {
    const [CesiumJs, setCesiumJs] = useState<CesiumType | null>(null);
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const cesiumContainerRef = useRef<HTMLDivElement>(null); 
    const fullscreenWrapperRef = useRef<HTMLDivElement>(null);

    //  Layer Visibility State
    const [showTileset, setShowTileset] = useState(true);
    const [showDefects, setShowDefects] = useState(true);

    const [severityVisibility, setSeverityVisibility] = useState<SeverityVisibility>({
        CRITICAL: true,
        HIGH: true,
        MEDIUM: true,
        LOW: true,
    });

    const handleToggleSeverity = (severity: keyof SeverityVisibility) => {
        setSeverityVisibility(prev => ({
            ...prev,
            [severity]: !prev[severity]
        }));
    };

    const handleToggleAllDefects = (show: boolean) => {
        setSeverityVisibility({
            CRITICAL: show,
            HIGH: show,
            MEDIUM: show,
            LOW: show,
        });
    };

    
    useEffect(() => {
        if (CesiumJs !== null) return;

        import("cesium").then((Cesium) => {
            setCesiumJs(Cesium as CesiumType);
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
        <div ref={fullscreenWrapperRef} className="relative w-full h-full bg-black" suppressHydrationWarning={true} >
            {CesiumJs ? (
                    <CesiumDynamicComponent
                        CesiumJs={CesiumJs}
                        cesiumContainerRef={cesiumContainerRef}
                        onFullscreenToggle={handleFullscreenToggle} 
                        isMapFullscreen={isMapFullscreen}
                        proxyBaseUrl={proxyBaseUrl}
                        camerasUrl={camerasUrl} 
                        tilesetUrl={tilesetUrl}
                        inspectionId={inspectionId}
                        initialDetections={initialDetections}
                        
                        onDefectDetected={onDefectDetected}
                        onDefectSelected={onDefectSelected}
                        focusedDefectId= {focusedDefectId}
                        
                        showTileset={showTileset}
                        onToggleTileset={() => setShowTileset(!showTileset)}
                        severityVisibility={severityVisibility}
                        onToggleSeverity={handleToggleSeverity}
                        onToggleAllDefects={handleToggleAllDefects}
                        layers={layers}
                        defectToEditImage={defectToEditImage}
                        onCloseImageEdit={onCloseImageEdit}
                    />
            ) : null}
            {children}
        </div>
    );
};

export default CesiumWrapper;