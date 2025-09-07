import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardElement } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import { TicketUpsertForm } from "@/features/ticket/components/ticket-form-upsert";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { ticketPath, ticketsPath } from "@/path";

import { notFound } from "next/navigation";


type TicketEditProps = {
    params : {
        ticketId: string;
    }
}

const TicketEditPage = async ({params}:TicketEditProps) => {
    const { ticketId } =  await(params);
    const ticket = await getTicket(ticketId);


    const isTicketFound= !!ticket;

    if (!isTicketFound || !ticket.isOwner){
        notFound();
    }

   
    return ( 
        <div className='flex-1 flex flex-col gap-y-8'>
        <Breadcrumbs breadcrumbs={[
            {title: 'Tickets', href:ticketsPath()},
            {title:ticket.title, href:ticketPath(ticket.id)},
            {title:'Edit'},
        ]}/>
        <Separator />
        
        <div className="flex-1 flex flex-col
         justify-center items-center" >
            <CardElement title="Edit Ticket" 
            description="Edit an existing Ticket"
            className="w-full max-w-[420px]"
            content={<TicketUpsertForm ticket={ticket} />}  />
        </div>    
        </div>
     );
}
 
export default TicketEditPage;