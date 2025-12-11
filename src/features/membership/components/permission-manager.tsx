"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Membership } from "@prisma/client";
import { Shield, ChevronDown } from "lucide-react";
import { PermissionToggle } from "./permission-toggle";

// We define the keys we care about to ensure type safety
type PermissionKey = 
  'canDeleteInspection' | 
  'canEditInspection' |
  'canDeleteDefect' |
  'canEditDefect'

type PermissionManagerProps = {
  membership: Membership;
  isAdmin: boolean;
};

export const PermissionManager = ({ membership, isAdmin }: PermissionManagerProps) => {
  
  // Helper to render a consistent row inside the dropdown
  const renderPermissionRow = (label: string, key: PermissionKey) => (
    <div className="flex items-center justify-between py-2 px-2 hover:bg-muted/50 rounded-sm transition-colors">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <PermissionToggle
        userId={membership.userId}
        organizationId={membership.organizationId}
        permissionKey={key}
        permissionValue={Boolean(membership[key])}
        disabled={isAdmin} // Admins have all rights implicitly
      />
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 border-dashed"
          disabled={isAdmin} // Optional: disable the menu entirely for admins
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Access</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Manage Permissions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {renderPermissionRow("Edit Inspections", "canEditInspection")}
        {renderPermissionRow("Delete Inspections", "canDeleteInspection")}
        {renderPermissionRow("Edit Defects", "canEditDefect")}
        {renderPermissionRow("Delete Defects", "canDeleteDefect")}
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
};