import { CircleCheck, FileText, Pencil } from 'lucide-react';

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