import { getTickets } from "../queries/get-tickets";
import { TicketItem } from "./ticket-item";
import { ParsedSearchParams } from "../search-params";
import { Placeholder } from "@/components/placeholder";
import { TicketSearchInput } from "./ticket-search-input";
import { TicketSortSelect } from "./ticket-sort-select";
import { TicketPagination } from "./ticket-pagination";

type TicketListProps = {
    userId ?: string;
    byOrganization?: boolean
    searchParams: ParsedSearchParams;
};

export const TicketLisT = async ({userId, byOrganization=false,searchParams}: TicketListProps) => {
    const {list: tickets, metadata: ticketMetadata}= await getTickets(
        userId,
        byOrganization,
        searchParams);
    return ( 
        <div className='flex-1 flex flex-col items-center gap-y-4' >
            <div className="w-full max-w-[420px] flex gap-x-2" >
                <TicketSearchInput placeholder='Search tickets' />
                <TicketSortSelect options={
                        [
                        {sortKey: 'createdAt' , 
                         sortValue:'desc', 
                         label:'Newest',
                        },

                        {sortKey: 'createdAt' , 
                         sortValue:'asc', 
                         label:'Oldest',
                        },

                        {sortKey:'bounty', 
                         sortValue:'desc',
                         label:'Bounty'}, 
                        ]
                    } />
            </div>
            { tickets.length ?(tickets.map(
                        (ticket) => (
                            <TicketItem key={ticket.id} ticket={ticket}  />
                        )
                )):(<Placeholder label="No Tickets Found" />)    
            }
            <div className="w-full max-w-[420px]" >
                <TicketPagination paginationTicketMtadata={ticketMetadata} />
            </div>
        </div>
     );
}