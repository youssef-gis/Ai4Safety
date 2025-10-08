'use client'

import dynamic from 'next/dynamic'
import React from 'react';

import type { Position } from './types/position';
import { CesiumType } from './types/cesium';

export interface CesiumComponentProps {
    CesiumJs: CesiumType;
    cesiumContainerRef: React.RefObject<HTMLDivElement | null> ;
    onFullscreenToggle?: () => void;
    isMapFullscreen?: boolean;
    tilesetUrl: string;
}

const CesiumDynamicComponent = dynamic(() => import('./Cesium')  , {
    ssr: false
});

type WrapperProps = {
  tilesetUrl: string;
};

export const CesiumWrapper:React.FunctionComponent<WrapperProps> = ({tilesetUrl}
) => {
    const [CesiumJs, setCesiumJs] = React.useState<CesiumType | null>(null);
    const [isMapFullscreen, setIsMapFullscreen] = React.useState(false);
    const cesiumContainerRef = React.useRef<HTMLDivElement>(null); 
    //const tilesetUrl = tilesetUrl;

    // ✅ NEW: This ref is for the PARENT container that holds both the map and the toolbar
    const fullscreenWrapperRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
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
                // Request fullscreen for the Cesium container
                fullscreenWrapperRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
               // setIsMapFullscreen(true);
            } else {
                // Exit fullscreen
                document.exitFullscreen();
              //  setIsMapFullscreen(false);
            }
        }
    };

    // Listen for fullscreen change events to update state if user exits via ESC key
    React.useEffect(() => {
        const handleFullscreenChange = () => {
           // if (!document.fullscreenElement) {
           //     setIsMapFullscreen(false);
           // }
            // This listener now reliably syncs our React state with the browser's state
            setIsMapFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={fullscreenWrapperRef} className="relative w-full h-full">

            {CesiumJs ? (
                <CesiumDynamicComponent
                    CesiumJs={CesiumJs}
                    cesiumContainerRef={cesiumContainerRef} // Pass the ref down
                    onFullscreenToggle={handleFullscreenToggle} // Pass the toggle function if Cesium needs it
                    isMapFullscreen={isMapFullscreen} // Pass the state down
                    tilesetUrl={tilesetUrl}
                />
            ) : null}

        </div>
   
    );
};

//     return (
//         CesiumJs ? <CesiumDynamicComponent CesiumJs={CesiumJs}  /> : null
//     )
// }

export default CesiumWrapper;