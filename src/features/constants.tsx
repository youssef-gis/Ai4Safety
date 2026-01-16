import { 
    CircleCheck, 
    FileText, 
    Pencil, // Keep for "Edit" buttons elsewhere, but don't use for status
    AlertTriangle, 
    Droplets, 
    Activity, 
    HelpCircle, 
    Search,
    AlertOctagon,
    AlertCircle,
    CheckCircle2, 
    Dam as DamIcon, 
    PauseCircle, 
    Archive,     
    PlayCircle,  
    Clock,      
    Flame       
} from 'lucide-react';

// Import actual Enums from Prisma
import { DetectionType, DetectionSeverity, DetectionStatus } from "@prisma/client";

// =========================================================
// PROJECT CONFIGURATION
// =========================================================

export const PROJECT_STATUS_CONFIG = {
    ACTIVE: { 
        label: 'Active', 
        icon: PlayCircle, 
        color: 'text-green-600',
        bg: 'bg-green-100'
    },
    ON_HOLD: { 
        label: 'On Hold', 
        icon: PauseCircle, 
        color: 'text-orange-500',
        bg: 'bg-orange-100'
    },
    COMPLETED: { 
        label: 'Completed', 
        icon: CircleCheck, 
        color: 'text-blue-600',
        bg: 'bg-blue-100'
    },
    ARCHIVED: { 
        label: 'Archived', 
        icon: Archive, 
        color: 'text-gray-500',
        bg: 'bg-gray-100'
    },
};

// =========================================================
// DETECTION / ISSUE CONFIGURATION
// =========================================================

export const DETECTION_TYPES = [
  {
    value: DetectionType.SPALLING_CRACK,
    label: "Spalling Crack", 
    icon: Activity,
  },
  {
    value: DetectionType.EFFLORESCENCE,
    label: "Efflorescence",
    icon: Droplets,
  },
  {
    value: DetectionType.WATER_DAMAGE,
    label: "Water Damage",
    icon: Droplets,
  },
  {
    value: DetectionType.CORROSION_STAIN,
    label: "Corrosion Stain",
    icon: AlertTriangle,
  },
  {
    value: DetectionType.INSULATION_FAULT,
    label: "Insulation Fault",
    icon: DamIcon,
  }
];

export const SEVERITIES = [
  {
    value: DetectionSeverity.CRITICAL,
    label: "Critical",
    icon: AlertOctagon,
    color: "text-red-600",
    bg: "bg-red-100" 
  },
  {
    value: DetectionSeverity.HIGH,
    label: "High",
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-100"
  },
  {
    value: DetectionSeverity.MEDIUM,
    label: "Medium",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-100"
  },
  {
    value: DetectionSeverity.LOW,
    label: "Low",
    icon: CheckCircle2,
    color: "text-slate-600",
    bg: "bg-slate-100"
  },
];

export const STATUSES = [
  {
    value: DetectionStatus.NEW,
    label: "New",
    icon: HelpCircle,
    color: "text-blue-500"
  },
  {
    value: DetectionStatus.IN_PROGRESS,
    label: "In Progress",
    icon: Activity, 
    color: "text-orange-500"
  },
  {
    value: DetectionStatus.ACKNOWLEDGED,
    label: "Acknowledged",
    icon: Search, 
    color: "text-indigo-500"
  },
  {
    value: DetectionStatus.RESOLVED,
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600"
  },
];