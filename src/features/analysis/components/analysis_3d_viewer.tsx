'use client'

import { useState } from "react";
import CesiumWrapper from "@/components/3D_Viewer/CesiumWrapper";
import { Detection } from "@prisma/client";
import { DetectionUpsertForm } from "@/features/defects/components/defect-form-upsert";
import { DefectCandidate } from "@/components/3D_Viewer/hooks/use-drawing-manager";
import { Entity } from "cesium";
import { useRouter } from "next/navigation";
import { MapLayer } from "@/components/3D_Viewer/types/map";
// Removed Portal import

type AnalaysisProps= {
  proxyBaseUrl:string;
  camerasUrl:string;
  tilesetUrl:string;
  inspectionId:string;
  initialDetections: Detection[];
  focusedDefectId?: string | null;
  canDeleteDefect: boolean;
  canEditDefect: boolean;
  layers: MapLayer[];
}

export const Analysis3DViewer = ({ proxyBaseUrl,camerasUrl,tilesetUrl, inspectionId, initialDetections,
     focusedDefectId, canDeleteDefect, canEditDefect, layers }: AnalaysisProps) => {
    const router = useRouter();
    
    const [defectCandidate, setDefectCandidate] = useState<DefectCandidate | null>(null);
    const [tempEntities, setTempEntities] = useState<Entity[]>([]); 
    const [editingDefect, setEditingDefect] = useState<Detection | null>(null);

    const handleDefectDetected = (candidate: DefectCandidate, entities: Entity[]) => {
        setDefectCandidate(candidate);
        setTempEntities(entities);
        setEditingDefect(null); 
    };

    const handleDefectSelected = (defect: Detection) => {
        setEditingDefect(defect);
        setDefectCandidate(null); 
    };

    const handleFormSuccess = () => {
        setDefectCandidate(null);
        setEditingDefect(null);
        setTempEntities([]); 
        router.refresh();
    };

    const handleFormCancel = () => {
        setDefectCandidate(null);
        setEditingDefect(null);
    };

        // Common style for both forms 
    const formContainerStyle = "absolute top-2 right-2 z-[1000] w-80 md:w-96 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[calc(100%-1rem)]";


    return (
        <div className="relative w-full h-full overflow-hidden">
            <CesiumWrapper
                proxyBaseUrl={proxyBaseUrl}
                camerasUrl={camerasUrl} 
                tilesetUrl={tilesetUrl}
                inspectionId={inspectionId}
                initialDetections={initialDetections}
                onDefectDetected={handleDefectDetected}
                onDefectSelected={handleDefectSelected}
                focusedDefectId={focusedDefectId}
                layers={layers} 
                >
                {/* Children rendered INSIDE the fullscreen div */}
                
                {/* Form for CREATING a new defect */}
                {defectCandidate && (
                    // Added 'pointer-events-auto' to ensure interactions work if parent has 'pointer-events-none'
                    <div className={formContainerStyle}>
                        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                            <DetectionUpsertForm
                                inspectionId={inspectionId}
                                geometry={{
                                    type: defectCandidate.type,
                                    coordinates: defectCandidate.positions.map((pos: any) => ({ 
                                        x: pos.x, y: pos.y, z: pos.z 
                                    })),
                                    measurement: defectCandidate.measurement,
                                    labelPosition: defectCandidate.labelPosition ? {
                                        x: defectCandidate.labelPosition.x,
                                        y: defectCandidate.labelPosition.y,
                                        z: defectCandidate.labelPosition.z
                                    } : undefined 
                                }}
                                onCancel={handleFormCancel}
                                onFormSuccess={handleFormSuccess}
                                canDelete={canDeleteDefect}
                                canEdit= {canEditDefect}
                            />
                        </div>
                    </div>
                )}

                {/* Form for EDITING an existing defect */}
                {editingDefect && (
                    <div className={formContainerStyle}>
                        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
                            <DetectionUpsertForm
                                detection={editingDefect}
                                inspectionId={inspectionId}
                                onCancel={handleFormCancel}
                                onFormSuccess={handleFormSuccess}
                                canDelete={canDeleteDefect}
                                canEdit= {canEditDefect}
                            />
                        </div>
                    </div>
                )}
            </CesiumWrapper>
        </div>
    )
}