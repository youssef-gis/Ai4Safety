'use client';

import { useState, useRef, useEffect } from "react";
import { Layers, Cuboid, AlertCircle, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SeverityVisibility = {
    CRITICAL: boolean;
    HIGH: boolean;
    MEDIUM: boolean;
    LOW: boolean;
};


type LayerControlProps = {
  showTileset: boolean;
  toggleTileset: () => void;
  severityVisibility: SeverityVisibility;
  toggleSeverity: (severity: keyof SeverityVisibility) => void;
  toggleAllDefects: (show: boolean) => void;
};

export const LayerControl = ({
  showTileset,
  toggleTileset,
  severityVisibility,
  toggleSeverity,
  toggleAllDefects
}: LayerControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDefectsExpanded, setIsDefectsExpanded] = useState(true); // Start expanded
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if all are true or some are true
  const allDefectsVisible = Object.values(severityVisibility).every(Boolean);
  const someDefectsVisible = Object.values(severityVisibility).some(Boolean);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant={isOpen ? "secondary" : "outline"}
        size="icon" 
        className="h-8 w-8"
        onClick={() => setIsOpen(!isOpen)}
        title="Layers"
      >
        <Layers className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className={cn(
            "absolute top-0 left-12 w-64 p-4 z-50 ml-2", // Positioned to the right of the toolbar
            "bg-card/95 backdrop-blur border border-border",
            "rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-sm text-foreground">Map Layers</h4>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* 1. 3D Model Toggle (Simple) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <Cuboid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Label htmlFor="tileset" className="cursor-pointer text-sm font-medium">3D Model</Label>
              </div>
              <input 
                  id="tileset"
                  type="checkbox" 
                  checked={showTileset} 
                  onChange={toggleTileset}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
            </div>

            <div className="h-px bg-border" />

            {/* 2.  Defects Group (Expandable) */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 p-0 hover:bg-transparent"
                            onClick={() => setIsDefectsExpanded(!isDefectsExpanded)}
                        >
                            {isDefectsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                        
                        <div className="flex items-center gap-2 ml-1">
                            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <Label htmlFor="defects-group" className="cursor-pointer text-sm font-medium">Defects</Label>
                        </div>
                    </div>
                    
                    {/* Master Checkbox */}
                    <input 
                        id="defects-group"
                        type="checkbox" 
                        checked={allDefectsVisible}
                        // Indeterminate visual logic usually requires a custom checkbox component, 
                        // but logic-wise: if not all visible, clicking makes them all visible.
                        onChange={() => toggleAllDefects(!allDefectsVisible)} 
                        className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                    />
                </div>

                {/* 3. Nested Severity Toggles */}
                {isDefectsExpanded && (
                    <div className="ml-9 space-y-2 border-l border-border pl-3">
                        
                        {/* Critical */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm" />
                                <span className="text-xs text-muted-foreground">Critical</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={severityVisibility.CRITICAL}
                                onChange={() => toggleSeverity("CRITICAL")}
                                className="h-3 w-3 rounded border-input cursor-pointer"
                            />
                        </div>

                        {/* High */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
                                <span className="text-xs text-muted-foreground">High</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={severityVisibility.HIGH}
                                onChange={() => toggleSeverity("HIGH")}
                                className="h-3 w-3 rounded border-input cursor-pointer"
                            />
                        </div>

                        {/* Medium */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm" />
                                <span className="text-xs text-muted-foreground">Medium</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={severityVisibility.MEDIUM}
                                onChange={() => toggleSeverity("MEDIUM")}
                                className="h-3 w-3 rounded border-input cursor-pointer"
                            />
                        </div>

                        {/* Low */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                                <span className="text-xs text-muted-foreground">Low</span>
                            </div>
                            <input 
                                type="checkbox"
                                checked={severityVisibility.LOW}
                                onChange={() => toggleSeverity("LOW")}
                                className="h-3 w-3 rounded border-input cursor-pointer"
                            />
                        </div>

                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};