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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InspectionAnalytics } from "@/features/analysis/components/inspection-analytics";
import { MapLayer } from "@/components/3D_Viewer/types/map";

interface AnalysisLayoutProps {
  projectId: string;
  inspectionId: string;
  camerasUrl: string;
  proxyBaseUrl:string;
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
  inspectionId,
  initialDetections,
  canDeleteDefect,
  canEditDefect
}: AnalysisLayoutProps) {
  
  console.log('Cameras Url ', camerasUrl);
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
          camerasUrl={camerasUrl}
          proxyBaseUrl={proxyBaseUrl}
          layers={layers}
          inspectionId={inspectionId}
          initialDetections={initialDetections}
          focusedDefectId={focusedDefectId} 
          canDeleteDefect={canDeleteDefect}
          canEditDefect= {canEditDefect}
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
        <Tabs defaultValue="table" className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 pt-2 border-b">
                <TabsList className="h-8">
                    <TabsTrigger value="table" className="text-xs">Defect Log</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden">
                <TabsContent value="table" className="h-full w-full p-0 m-0 overflow-auto">
                    <div className="p-4">
                        <DefectTable 
                            data={initialDetections} 
                            onViewDefect={handleViewDefect}
                            canDeleteDefect={canDeleteDefect} 
                            canEditDefect= {canEditDefect}
                            // inspectionId={inspectionId} 
                        />
                    </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="h-full w-full p-0 m-0 overflow-auto">
                    <InspectionAnalytics />
                </TabsContent>
            </div>
        </Tabs>
      </ResizablePanel>

    </ResizablePanelGroup>
  );
}