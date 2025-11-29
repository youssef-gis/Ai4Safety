"use client"

import { Button } from "@/components/ui/button";
import { Detection } from "@prisma/client";
import { FileDown, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { InspectionPDFTemplate } from "./inspection-pdf-template";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";


interface InspectionActionsProps {
  inspectionId: string;
  defects: Detection[]; 
  projectName?: string;
}

export function InspectionActions({ inspectionId, defects, projectName }: InspectionActionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info("Generating report...");

      // 1. Create the PDF instance
      const blob = await pdf(
        <InspectionPDFTemplate 
            inspectionId={inspectionId} 
            defects={defects} 
            projectName={projectName}
        />
      ).toBlob();

      // 2. Save it
      saveAs(blob, `Inspection_Report_${inspectionId}.pdf`);
      
      toast.success("Report downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 border-slate-700 hover:bg-slate-800 hover:text-white"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <FileDown className="mr-2 h-4 w-4" />
        )}
        {/* {isExporting ? "Exporting..." : "Export PDF"} */}
      </Button>

      {/* add a secondary action later*/}
      {/* <Button variant="ghost" size="icon" className="h-8 w-8">
         <MoreHorizontal className="h-4 w-4" />
      </Button> */}
    </div>
  );
}