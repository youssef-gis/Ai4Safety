import { CircleCheck, FileText, Pencil } from 'lucide-react';

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