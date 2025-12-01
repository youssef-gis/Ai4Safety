'use client';

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Detection } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DefectSearchProps = {
  defects: Detection[];
  onSelectDefect: (id: string) => void;
};

export const DefectSearch = ({ defects, onSelectDefect }: DefectSearchProps) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter logic
  const filteredDefects = defects.filter((d) => {
    if (!query) return false;
    const searchStr = `${d.type} ${d.severity} ${d.notes || ""}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  const handleSelect = (id: string) => {
    onSelectDefect(id);
    setIsExpanded(false); // Collapse on select? Or keep open?
    setQuery(""); 
  };

  const handleExpand = () => {
      setIsExpanded(true);
      // Wait for animation/render then focus
      setTimeout(() => inputRef.current?.focus(), 100);
  }

  const handleCollapse = () => {
      setIsExpanded(false);
      setQuery("");
  }

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!query) { // Only collapse if empty, otherwise keep results open
            setIsExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  return (
    <div ref={containerRef} className={cn(
        "relative flex items-center transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-10" // Animate width
    )}>
      
      {/* The Search Icon Button (Always Visible or part of input) */}
      <div className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-center z-20",
          isExpanded ? "pointer-events-none" : "cursor-pointer"
      )}
        onClick={!isExpanded ? handleExpand : undefined}
      >
          <Button 
            variant={isExpanded ? "ghost" : "secondary"} 
            size="icon" 
            className={cn(
                "h-10 w-10 shadow-md transition-all", 
                isExpanded ? "bg-transparent shadow-none hover:bg-transparent" : ""
            )}
          >
            <Search className={cn("h-4 w-4", isExpanded ? "text-muted-foreground" : "")} />
          </Button>
      </div>

      {/* The Input Field (Hidden/Shown) */}
      <Input
          ref={inputRef}
          placeholder="Find defects..."
          className={cn(
           "pl-10 pr-8 bg-card/90 backdrop-blur border-border shadow-md h-10 transition-all duration-300",
            isExpanded ? "opacity-100 w-full" : "opacity-0 w-0 p-0 border-none"
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
      />

      {/* Close Button (Only when expanded) */}
      {isExpanded && (
          <button 
              onClick={handleCollapse}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-20"
          >
              <X className="h-4 w-4" />
          </button>
      )}

      {/* Results Dropdown */}
      {isExpanded && query.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-full bg-card border border-border rounded-md shadow-xl max-h-60 overflow-y-auto z-50">
          {filteredDefects.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">No results found.</div>
          ) : (
            <ul className="py-1">
              {filteredDefects.map((defect) => (
                <li
                  key={defect.id}
                  onClick={() => handleSelect(defect.id)}
                  className="px-3 py-2 hover:bg-accent cursor-pointer text-sm flex items-center justify-between group border-b border-border/50 last:border-0"
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{defect.type!.replace('_', ' ')}</span>
                    {defect.notes && (
                        <span className="text-xs text-muted-foreground truncate">
                            {defect.notes}
                        </span>
                    )}
                  </div>
                  <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-2",
                      defect.severity === 'CRITICAL' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      defect.severity === 'HIGH' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                      {defect.severity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};