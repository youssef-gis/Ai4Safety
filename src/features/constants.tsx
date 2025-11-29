import { CircleCheck, 
    FileText, 
    Pencil,
    AlertTriangle, 
    Droplets, 
    Activity, 
    HelpCircle, 
    Search,
    AlertOctagon,
    AlertCircle,
    CheckCircle2, 
    DamIcon
} from 'lucide-react';

export const ProjectsIcn = {
    ACTIVE: <FileText /> ,
    ON_HOLD: <Pencil />,
    COMPLETED: <CircleCheck />,
    ARCHIVED: <Pencil />,
};

export const ProjectStatusLabels = {
    ACTIVE: 'ACTIVE',
    ON_HOLD: 'ON_HOLD',
    COMPLETED: 'COMPLETED',
    ARCHIVED: 'ARCHIVED',
}

export const TicketsIcn = {
    Open: <FileText /> ,
    IN_PROGRESS: <Pencil />,
    Done: <CircleCheck />
};

export const TicketStatusLabels = {
    Open: 'Open',
    IN_PROGRESS: 'IN_PROGRESS',
    Done: 'Done'
}


// Import actual Enums from Prisma if available, or define matching types
import { DetectionType, DetectionSeverity, DetectionStatus } from "@prisma/client";

export const DETECTION_TYPES = [
  {
    value:  DetectionType.SPALLING_CRACK, // Matches Prisma DetectionType.CRACK
    label: "CRACK",
    icon: Activity,
  },
  {
    value: DetectionType.EFFLORESCENCE, // Matches Prisma DetectionType.RUST
    label: "EFFLORESCENCE",
    icon: Droplets,
  },
  {
    value: DetectionType.WATER_DAMAGE,
    label: "WATER DAMAGE",
    icon: AlertTriangle,
  },
  {
    value: DetectionType.CORROSION_STAIN,
    label: "CORROSION STAIN",
    icon: HelpCircle,
  },
  {
    value: DetectionType.INSULATION_FAULT,
    label: "INSULATION FAULT",
    icon: DamIcon,
  }
];

export const SEVERITIES = [
  {
    value: DetectionSeverity.CRITICAL,
    label: "CRITICAL",
    icon: AlertOctagon,
  },
  {
    value: DetectionSeverity.HIGH,
    label: "HIGH",
    icon: AlertCircle,
  },
  {
    value: DetectionSeverity.MEDIUM,
    label: "MEDIUM",
    icon: AlertTriangle,
  },
  {
    value: DetectionSeverity.LOW,
    label: "LOW",
    icon: CheckCircle2,
  },
];

export const STATUSES = [
  {
    value: DetectionStatus.NEW,
    label: "NEW",
    icon: HelpCircle,
  },
  {
    value: DetectionStatus.IN_PROGRESS,
    label: "IN PROGRESS",
    icon: Activity,
  },
  {
    value: DetectionStatus.ACKNOWLEDGED,
    label: "ACKNOWLEDGED",
    icon: Search,
  },
  {
    value: DetectionStatus.RESOLVED,
    label: "RESOLVED",
    icon: CheckCircle2,
  },
];