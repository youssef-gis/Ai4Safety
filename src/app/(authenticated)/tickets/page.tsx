
import { CardElement } from '@/components/card-compact';
import Heading from '@/components/heading';
import { Spinner } from '@/components/spinner';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-rerdirect';
import { TicketUpsertForm } from '@/features/ticket/components/ticket-form-upsert';

import { TicketLisT } from '@/features/ticket/components/ticket-list';
import { ParsedSearchParams, searchParamsCache } from '@/features/ticket/search-params';

import { Suspense } from 'react';

//caching process
//export const dynamic='force-dynamic';

type TicketsPageProps ={
    searchParams: ParsedSearchParams
}

const TicketsPAge = async ({searchParams}: TicketsPageProps) => {
    const {user}= await getAuthOrRedirect()
    return (
        <div className="flex-1 flex flex-col gap-y-8" >
            <Heading title='Tickets Page' 
                    description='Your tickets in one place' />
            
            <div className='flex-1 flex flex-col justify-center items-center' >
            <CardElement title='Create Ticket' description='A new Ticket will be created'
                        content={<TicketUpsertForm />} 
                        className='w-full max-w-[420px]' />
            </div>
            
            <Suspense fallback= {<Spinner />} >
            
                <TicketLisT userId={user?.id} 
                searchParams={searchParamsCache.parse(searchParams)}  
                />
            </Suspense>

        </div>
     );
}
 
export default TicketsPAge;