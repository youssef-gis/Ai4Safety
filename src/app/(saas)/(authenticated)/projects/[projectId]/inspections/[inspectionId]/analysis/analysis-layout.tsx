"use client"

import { useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

import { Analysis3DViewer } from "@/features/analysis/components/analysis_3d_viewer";
import DefectTable from "@/features/defects/defect-table";
import { Detection } from "@prisma/client";

interface AnalysisLayoutProps {
  projectId: string;
  inspectionId: string;
  tilesetUrl: string;
  initialDetections: Detection[];
}

export function AnalysisLayout({
  tilesetUrl,
  inspectionId,
  initialDetections
}: AnalysisLayoutProps) {
  
  // Refs to control panel sizes
  const mapPanelRef = useRef<ImperativePanelHandle>(null);
  const tablePanelRef = useRef<ImperativePanelHandle>(null);
  
  // State for the "Fly To" logic
  const [focusedDefectId, setFocusedDefectId] = useState<string | null>(null);

  // The "Focus Mode" Handler
  const handleViewDefect = (id: string) => {
    setFocusedDefectId(id); // Triggers Cesium FlyTo

    // Resize Panels: Map 75%, Table 25%
    if (mapPanelRef.current && tablePanelRef.current) {
      mapPanelRef.current.resize(75);
      tablePanelRef.current.resize(25);
    }
  };

  return (
    <ResizablePanelGroup direction="vertical" className="h-full w-full">
      
      {/* Top PANEL: 3D VIEWER */}
      <ResizablePanel 
        ref={mapPanelRef} 
        defaultSize={60} 
        minSize={30}
        className="relative"
      >
        {/* We pass focusedDefectId down to Cesium wrapper */}
        <Analysis3DViewer 
          tilesetUrl={tilesetUrl}
          inspectionId={inspectionId}
          initialDetections={initialDetections}
          focusedDefectId={focusedDefectId} 
        />
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-border/70 h-2" />

      {/* BUTTOM PANEL: TABLE */}
      <ResizablePanel 
        ref={tablePanelRef} 
        defaultSize={40} 
        minSize={10}
        className="bg-transparent"
      >
        <div className="h-full w-full overflow-auto p-4">
          <DefectTable 
            data={initialDetections} 
            onViewDefect={handleViewDefect} 
            inspectionId={inspectionId}
          />
        </div>
      </ResizablePanel>

    </ResizablePanelGroup>
  );
}