
import { CardElement } from '@/components/card-compact';
import Heading from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { TicketUpsertForm } from '@/features/ticket/components/ticket-form-upsert';

import { TicketLisT } from '@/features/ticket/components/ticket-list';
import {  ParsedSearchParams, searchParamsCache } from '@/features/ticket/search-params';

import { Suspense } from 'react';



type TicketsByOrganizationPageProps ={
    searchParams: ParsedSearchParams
}

const TicketsByOrganizationPage = async ({searchParams}: TicketsByOrganizationPageProps) => {

    return (
        <div className="flex-1 flex flex-col gap-y-8" >
            <Heading title='Tickets Organization' 
                    description='Tickets Organization' />
            
            <div className='flex-1 flex flex-col justify-center items-center' >
            <CardElement title='Create Ticket' 
                description='A new Ticket will be created'
                content={<TicketUpsertForm />} 
                className='w-full max-w-[420px]' />
            </div>
            
            <Suspense fallback= {<Spinner />} >
            
                <TicketLisT byOrganization 
                searchParams={searchParamsCache.parse(searchParams)}  
                />
            </Suspense>

        </div>
     );
}
 
export default TicketsByOrganizationPage;