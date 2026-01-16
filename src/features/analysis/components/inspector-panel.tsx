"use client";

import { useState } from "react";
import { Detection, Supplement } from "@prisma/client";
import { 
  ChevronLeft, 
  X, 
  Search, 
  Filter, 
  AlertTriangle,
  FileText,
  History,
  Camera,
  Plus,
  Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { DetectionUpsertForm } from "@/features/defects/components/defect-form-upsert";

import { DefectCandidate } from "@/components/3D_Viewer/hooks/use-drawing-manager";
import { useRouter } from "next/navigation";

interface InspectorPanelProps {
  inspectionId: string;
  projectId: string;
  defects: Detection[];
  camerasUrl: string;
  proxyBaseUrl: string;
  canDeleteDefect: boolean;
  canEditDefect: boolean;
  focusedDefectId: string | null;
  draftDefect?: { 
    position: { x: number, y: number, z: number }; 
  } | null; 
  onSelectDefect: (id: string | null) => void;
  onClose: () => void;
}

const EvidenceFiles = ({ defect }: { defect: Detection & { attachments?: Supplement[] } }) => {
  
  if (!defect.attachments || defect.attachments.length === 0) {
    return (
        <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-md">
            No files attached to this defect.
        </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Attached Files ({defect.attachments.length})
      </h4>
      
      <div className="flex flex-col gap-2">
        {defect.attachments.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors group">
            
            <div className="flex items-center gap-3 min-w-0">

                {file.name.endsWith('.pdf') ? (
                  <FileText className="w-4 h-4 text-red-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0 text-[10px] font-bold">IMG</div>
                )}
                
                <div className="flex flex-col min-w-0">
                    <a 
                        href={`/api/aws/s3/supplements/${file.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-medium truncate text-foreground hover:underline hover:text-blue-600"
                    >
                        {file.name}
                    </a>
                    <span className="text-[10px] text-muted-foreground">
                        {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <a 
                href={`/api/aws/s3/supplements/${file.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-background/80"
                title="Download"
            >
               <Download className="w-4 h-4" />
            </a>

          </div>
        ))}
      </div>
    </div>
  );
};

const DefectCard = ({ defect, onClick }: { defect: Detection; onClick: () => void }) => {
  const severityColors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
    LOW: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };

  const badgeColor = severityColors[defect.severity || "LOW"] || severityColors["LOW"];

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-pointer transition-all shadow-sm"
    >
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          ID: #{defect.id.slice(-4)}
        </span>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", badgeColor)}>
          {defect.severity}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-semibold text-sm text-foreground">
          {defect.type?.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          defect.status === "RESOLVED" ? "bg-green-500" : 
          defect.status === "IN_PROGRESS" ? "bg-orange-500" : "bg-blue-500"
        )} />
        {defect.status?.replace("_", " ")}
      </div>
    </div>
  );
};

export function InspectorPanel({
  inspectionId,
  projectId,
  defects,
  camerasUrl,
  proxyBaseUrl,
  canDeleteDefect,
  canEditDefect,
  focusedDefectId,
  draftDefect,
  onSelectDefect,
  onClose
}: InspectorPanelProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  const [defectToEditImage, setDefectToEditImage] = useState<Detection | null>(null);  
  const [defectCandidate, setDefectCandidate] = useState<DefectCandidate | null>(null);
  const [editingDefect, setEditingDefect] = useState<Detection | null>(null);
  const handleOpenImageEdit = (defect: Detection) => {
        setDefectToEditImage(defect);
    };
  
  const handleFormSuccess = () => {
        setDefectCandidate(null);
        setEditingDefect(null);
        router.refresh();
    };

  const filteredDefects = defects.filter(d => 
    d.type?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.id.includes(searchQuery)
  );

  const isCreating = !!draftDefect;
  const activeDefect = defects.find(d => d.id === focusedDefectId);


  const showDetailView = activeDefect || isCreating;

  return (
    <div className="flex flex-col h-full w-full bg-background/95 backdrop-blur-sm">
      

      <div className="flex-none h-14 px-4 border-b border-border flex items-center justify-between bg-card/50">
        {showDetailView ? (
          <div className="flex items-center gap-1 overflow-hidden">
            <Button variant="ghost" size="icon" onClick={() => onSelectDefect(null)} className="-ml-2 h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex flex-col">
              <span className="font-semibold text-sm truncate">
                {isCreating ? "New Defect" : activeDefect?.type?.replace("_", " ")}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {isCreating ? "Draft" : `#${activeDefect?.id.slice(0, 8)}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="font-semibold text-sm">Inspector Panel</div>
        )}
        
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {showDetailView ? (
          // === DETAIL VIEW ===
          <div className="h-full flex flex-col">
            {/* A. VIEW/EDIT EXISTING DEFECT */}
            {activeDefect && !isCreating ? (
            <>
              {/* Status Header */}
              <div className="flex-none px-4 py-3 border-b border-border bg-card/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={activeDefect?.status === 'RESOLVED' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                      {activeDefect?.status?.replace('_', ' ')}
                    </Badge>
                </div>
                {/* <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium">Maintenance Team A</span>
                </div> */}
              </div>

              <Tabs defaultValue="evidence" className="flex-1 flex flex-col min-h-0">
                <div className="flex-none px-4 pt-2 border-b border-border">
                  <TabsList className="w-full grid grid-cols-2 bg-transparent p-0">
                    <TabsTrigger 
                      value="evidence" 
                      className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none pb-2"
                    >
                      Evidence
                    </TabsTrigger>
                    <TabsTrigger 
                      value="history" 
                      className="text-xs data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none pb-2"
                    >
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 pb-24"> 
                      <TabsContent value="evidence" className="mt-0 space-y-6">
                          {activeDefect && <EvidenceFiles defect={activeDefect} />} 
                          <div className="h-px bg-border w-full" />
                          <div className="space-y-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Technical Data
                              </h4>
                              <DetectionUpsertForm 
                                  detection={activeDefect}
                                  inspectionId={inspectionId}
                                  projectId={projectId}
                                  geometry={undefined}
                                  canDelete={canDeleteDefect} 
                                  canEdit={canEditDefect}
                                  onCancel={() => onSelectDefect(null)}
                                  onFormSuccess={handleFormSuccess}
                                  onOpenImage={handleOpenImageEdit}
                              />
                          </div>
                      </TabsContent>
                      
                      <TabsContent value="history" className="mt-0 pt-4">
                          <div className="border-l-2 border-border ml-2 space-y-6">
                              {[
                                  { date: "Jan 10", user: "System", action: "Created defect" },
                                  { date: "Jan 12", user: "User", action: "Uploaded report" }
                              ].map((log, i) => (
                                  <div key={i} className="relative pl-6">
                                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-border" />
                                      <div className="text-xs text-muted-foreground mb-0.5">{log.date}</div>
                                      <div className="text-sm">
                                          <span className="font-medium text-foreground">{log.user}: </span>
                                          {log.action}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </TabsContent>
                  </div>
                </div>
              </Tabs>
            </>):(
            
            <>
            <div className="p-4 overflow-y-auto">
                 <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        New defect draft at location: <br/>
                        <span className="font-mono">
                            {draftDefect?.position.x.toFixed(2)}, {draftDefect?.position.y.toFixed(2)}
                        </span>
                    </p>
                 </div>
                 
                 <DetectionUpsertForm 
                    inspectionId={inspectionId}
                    projectId={projectId}
                    geometry={draftDefect ? {
                        type: 'point',
                        coordinates: [draftDefect.position]
                    } : undefined}
                    canDelete={canDeleteDefect} 
                    canEdit={canEditDefect}
                    onCancel={() => {
                        
                        onSelectDefect(null); 
                    }}
                    onFormSuccess={() => {
                        handleFormSuccess();
                        onClose(); 
                    }}
                    onOpenImage={() => {}} 
                />
            </div>
            </>)}
 
          </div>
        ) : (
        
          <div className="h-full flex flex-col">
            <div className="flex-none p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search defects..."
                  className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-none px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 bg-muted/20">
              <span>{filteredDefects.length} Issues Found</span>
              <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2 hover:bg-background">
                <Filter className="w-3 h-3" /> Filter
              </Button>
            </div>

           
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 flex flex-col gap-3 pb-20">
                {filteredDefects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Search className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">No defects found</p>
                  </div>
                ) : (
                  filteredDefects.map((defect) => (
                    <DefectCard 
                      key={defect.id} 
                      defect={defect} 
                      onClick={() => onSelectDefect(defect.id)} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}