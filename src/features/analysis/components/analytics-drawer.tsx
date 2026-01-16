"use client";

import { useEffect, useState } from "react";
import { Detection } from "@prisma/client";
import { X, ChevronDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InspectionAnalytics } from "./inspection-analytics";

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  detections: Detection[];
}

export function AnalyticsDrawer({ isOpen, onClose, detections }: AnalyticsDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

 
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-y-0" : "translate-y-full",
        "h-[320px] md:h-[350px]" 
      )}
    >

      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-sm">Project Analytics</h3>
          <span className="text-xs text-muted-foreground ml-2 border-l border-border pl-2">
            Based on {detections.length} total findings
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-secondary" 
            onClick={onClose}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

     
      <div className="flex-1 p-4 overflow-hidden">
       
        <InspectionAnalytics />
      </div>
    </div>
  );
}