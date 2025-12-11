// import { CircleCheck, 
//     FileText, 
//     Pencil,
//     AlertTriangle, 
//     Droplets, 
//     Activity, 
//     HelpCircle, 
//     Search,
//     AlertOctagon,
//     AlertCircle,
//     CheckCircle2, 
//     DamIcon
// } from 'lucide-react';

// export const ProjectsIcn = {
//     ACTIVE: <FileText /> ,
//     ON_HOLD: <Pencil />,
//     COMPLETED: <CircleCheck />,
//     ARCHIVED: <Pencil />,
// };

// export const ProjectStatusLabels = {
//     ACTIVE: 'ACTIVE',
//     ON_HOLD: 'ON_HOLD',
//     COMPLETED: 'COMPLETED',
//     ARCHIVED: 'ARCHIVED',
// }

// export const TicketsIcn = {
//     Open: <FileText /> ,
//     IN_PROGRESS: <Pencil />,
//     Done: <CircleCheck />
// };

// export const TicketStatusLabels = {
//     Open: 'Open',
//     IN_PROGRESS: 'IN_PROGRESS',
//     Done: 'Done'
// }


// // Import actual Enums from Prisma if available, or define matching types
// import { DetectionType, DetectionSeverity, DetectionStatus } from "@prisma/client";

// export const DETECTION_TYPES = [
//   {
//     value:  DetectionType.SPALLING_CRACK, // Matches Prisma DetectionType.CRACK
//     label: "CRACK",
//     icon: Activity,
//   },
//   {
//     value: DetectionType.EFFLORESCENCE, // Matches Prisma DetectionType.RUST
//     label: "EFFLORESCENCE",
//     icon: Droplets,
//   },
//   {
//     value: DetectionType.WATER_DAMAGE,
//     label: "WATER DAMAGE",
//     icon: AlertTriangle,
//   },
//   {
//     value: DetectionType.CORROSION_STAIN,
//     label: "CORROSION STAIN",
//     icon: HelpCircle,
//   },
//   {
//     value: DetectionType.INSULATION_FAULT,
//     label: "INSULATION FAULT",
//     icon: DamIcon,
//   }
// ];

// export const SEVERITIES = [
//   {
//     value: DetectionSeverity.CRITICAL,
//     label: "CRITICAL",
//     icon: AlertOctagon,
//   },
//   {
//     value: DetectionSeverity.HIGH,
//     label: "HIGH",
//     icon: AlertCircle,
//   },
//   {
//     value: DetectionSeverity.MEDIUM,
//     label: "MEDIUM",
//     icon: AlertTriangle,
//   },
//   {
//     value: DetectionSeverity.LOW,
//     label: "LOW",
//     icon: CheckCircle2,
//   },
// ];

// export const STATUSES = [
//   {
//     value: DetectionStatus.NEW,
//     label: "NEW",
//     icon: HelpCircle,
//   },
//   {
//     value: DetectionStatus.IN_PROGRESS,
//     label: "IN PROGRESS",
//     icon: Activity,
//   },
//   {
//     value: DetectionStatus.ACKNOWLEDGED,
//     label: "ACKNOWLEDGED",
//     icon: Search,
//   },
//   {
//     value: DetectionStatus.RESOLVED,
//     label: "RESOLVED",
//     icon: CheckCircle2,
//   },
// ];

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
    Dam as DamIcon, // Renamed for clarity
    PauseCircle, // NEW: For On Hold
    Archive,     // NEW: For Archived
    PlayCircle,  // NEW: For Active
    Clock,       // NEW: For In Progress
    Flame        // NEW: For Fire/Critical visual variety
} from 'lucide-react';

// Import actual Enums from Prisma
import { DetectionType, DetectionSeverity, DetectionStatus } from "@prisma/client";

// =========================================================
// PROJECT CONFIGURATION
// =========================================================

// Combined config allows you to get Label, Icon, and Color from one key
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
    label: "Spalling Crack", // Title Case
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
    icon: Droplets, // Changed from Triangle to Droplets for context
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
    bg: "bg-red-100" // Background color for badges
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
    icon: Activity, // Activity implies work being done
    color: "text-orange-500"
  },
  {
    value: DetectionStatus.ACKNOWLEDGED,
    label: "Acknowledged",
    icon: Search, // Search implies investigation
    color: "text-indigo-500"
  },
  {
    value: DetectionStatus.RESOLVED,
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600"
  },
];