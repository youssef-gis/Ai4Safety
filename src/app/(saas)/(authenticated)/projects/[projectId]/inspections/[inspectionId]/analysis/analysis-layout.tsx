"use client"

import { useRef, useState } from "react";
import { Analysis3DViewer } from "@/features/analysis/components/analysis_3d_viewer";
import { InspectorPanel } from "@/features/analysis/components/inspector-panel";
import { AnalyticsDrawer } from "@/features/analysis/components/analytics-drawer";
import { Detection } from "@prisma/client";
import { MapLayer } from "@/components/3D_Viewer/types/map";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Maximize2, 
  Minimize2, 
  PanelRightOpen, 
  PanelRightClose 
} from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Defect } from "@/features/defects/columns";

interface AnalysisLayoutProps {
  projectId: string;
  inspectionId: string;
  camerasUrl: string;
  proxyBaseUrl: string;
  tilesetUrl: string;
  layers: MapLayer[];
  initialDetections: Detection[];
  canDeleteDefect: boolean;
  canEditDefect: boolean;
}

export function AnalysisLayout({
  camerasUrl,
  proxyBaseUrl,
  tilesetUrl,
  layers,
  projectId,
  inspectionId,
  initialDetections,
  canDeleteDefect,
  canEditDefect
}: AnalysisLayoutProps) {
  
  const [isInspectorOpen, setIsInspectorOpen] = useState(false); 
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedDefectId, setFocusedDefectId] = useState<string | null>(null);

  const [draftDefect, setDraftDefect] = useState<{ position: {x:number, y:number, z:number} } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

// Handler for when user clicks the 3D model
  const handleDraftCreated = (data: { positions: any[] }) => {
      // 1. Extract the position (assuming single point for now)
      const position = data.positions[0]; 
      
      // 2. Set draft state
      setDraftDefect({ position: { x: position.x, y: position.y, z: position.z } });
      
      // 3. Open the inspector
      setIsInspectorOpen(true);
      
      // 4. Clear any focused existing defect so we don't show that
      setFocusedDefectId(null);
  };

  const handleDefectSelect = (id: string | null) => {
      if (id) setDraftDefect(null);
      setFocusedDefectId(id);
      if (id) setIsInspectorOpen(true);
  };

  // Close handler needs to clear draft too
  const handleCloseInspector = () => {
      setIsInspectorOpen(false);
      setDraftDefect(null);
      setFocusedDefectId(null);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative h-full w-full overflow-hidden bg-black group"
    >
      
      {/* 1. LAYER A: 3D VIEWER (BACKGROUND) */}
      <div className="absolute inset-0 z-0">
        <Analysis3DViewer 
            tilesetUrl={tilesetUrl}
            camerasUrl={camerasUrl}
            proxyBaseUrl={proxyBaseUrl}
            layers={layers}
            inspectionId={inspectionId}
            initialDetections={initialDetections}
            focusedDefectId={focusedDefectId} 
            canDeleteDefect={canDeleteDefect}
            canEditDefect={canEditDefect}
            onDefectSelected={(defect) => handleDefectSelect(defect.id)}
            onDefectDetected={(candidate: any) => handleDraftCreated(candidate)}
        />
      </div>

      {/* 2. LAYER B: FLOATING HUD (The "Command Bar") */}

      {/* BOTTOM RIGHT: Main Action Bar */}
      <div className={cn(
          "absolute bottom-6 right-6 z-20 flex items-center p-1.5 gap-2 rounded-xl transition-all duration-300",
          "bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl", 
          isInspectorOpen ? "translate-x-[-384px] md:translate-x-[-400px]" : "translate-x-0"
      )}>
        
        {/* Analytics Toggle */}
        <Button 
            variant={isAnalyticsOpen ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className={cn(
            "text-black hover:bg-white/10",
            isAnalyticsOpen && "bg-white/20"
        )}
        >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
        </Button>

        {/* Vertical Separator */}
        <div className="h-4 w-px bg-white/20" />

        {/* Inspector Toggle (Primary Blue Button) */}
        <Button 
            variant={isInspectorOpen ? "secondary" : "default"} 
            size="sm" 
            className={cn(
                        "shadow-none transition-all",
                        !isInspectorOpen && "bg-blue-600 hover:bg-blue-700 text-white border-none"
                    )}
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
        >
            {isInspectorOpen ? (
                <>
                <PanelRightClose className="w-4 h-4 mr-2" />
                Close Panel
                </>
            ) : (
                <>
                <PanelRightOpen className="w-4 h-4 mr-2" />
                Inspector Panel
                </>
            )}
        </Button>
        {/* Vertical Separator */}
        <div className="h-4 w-px bg-white/20 mx-1" />

        {/* 3. Fullscreen Toggle (Icon Only) */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="h-9 w-9 text-white hover:bg-white/10 rounded-lg"
            title="Toggle Fullscreen"
        >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* 3. LAYER C: INSPECTOR PANEL (SLIDE IN FROM RIGHT) */}
      <div 
        className={cn(
          "absolute top-0 right-0 h-full z-30 transition-transform duration-300 ease-in-out shadow-2xl border-l border-border/50 bg-background",
          "w-full md:w-[400px]", 
          isInspectorOpen ? "translate-x-0" : "translate-x-full"
      )}
        //style={{ width: '400px' }} // Fixed width matching mockup
      >
        {/* Render content only when needed or keep mounted for state preservation */}
        <InspectorPanel 
            inspectionId={inspectionId}
            projectId={projectId}
            defects={initialDetections}
            focusedDefectId={focusedDefectId}
            onSelectDefect={handleDefectSelect}
            onClose={handleCloseInspector}
            draftDefect={draftDefect}
            camerasUrl={camerasUrl}
            proxyBaseUrl={proxyBaseUrl}
            canDeleteDefect={canDeleteDefect}
            canEditDefect={canEditDefect}
            
        />
      </div>

      {/* 4. LAYER D: ANALYTICS DRAWER (SLIDE UP FROM BOTTOM) */}
      <AnalyticsDrawer 
          isOpen={isAnalyticsOpen} 
          onClose={() => setIsAnalyticsOpen(false)} 
          detections={initialDetections}
      />

    </div>
  );
}