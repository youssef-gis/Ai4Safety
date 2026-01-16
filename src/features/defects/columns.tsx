"use client"

import { ColumnDef } from "@tanstack/react-table"
import {  Eye, MoreHorizontal } from "lucide-react"
import { ArrowUpDown } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DETECTION_TYPES, STATUSES, SEVERITIES } from "../constants"
import { DetectionType, DetectionSeverity, DetectionStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge"


export type Defect = {
  id: string;
  type: DetectionType | null;
  severity: DetectionSeverity | null;
  status: DetectionStatus | null;
}

export const getColumns = (onViewDefect: (id: string) => void): ColumnDef<Defect>[] => [
    {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  
  {
    accessorKey: "type",
    header: "Defect type",
    cell: ({ row }) => {
      
      const type = DETECTION_TYPES.find(
        (t) => t.value === row.getValue("type")
      );

      if (!type) {
        return null;
      }

      return (
        <div className="flex items-center">
          {type.icon && (
            <type.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{type.label}</span>
        </div>
      )
    },
  },
  
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = STATUSES.find(
        (s) => s.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
  },
    
  {
    accessorKey: "severity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Severity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const severity = SEVERITIES.find(
        (s) => s.value === row.getValue("severity")
      )

      if (!severity) {
        return null
      }

     
      const variant = 
        severity.value === "CRITICAL" ? "destructive" :
        severity.value === "HIGH" ? "default" :  "secondary"; 

      return (
        <div className="flex items-center">
           <Badge variant={variant} className="flex items-center gap-1 font-normal">
              {severity.icon && <severity.icon className="h-3 w-3" />}
              {severity.label}
           </Badge>
        </div>
      )
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const defect = row.original
 
      return (
        <div className="flex items-center gap-2">
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onViewDefect(defect.id)}
                className="h-8 w-8 p-0"
            >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View on Map</span>
            </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(defect.id)}
            >
              Copy Defect ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDefect(defect.id)}>
                    View on Map
            </DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete defect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      )
    },
  },
]