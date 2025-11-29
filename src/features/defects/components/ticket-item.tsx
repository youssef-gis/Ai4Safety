
import {clsx} from 'clsx';
import { ticketEditPath, ticketPath } from '@/path';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";


import Link from 'next/link';

import { toCurrencyFromCent } from "@/utils/currency";

import { LucideMoreVertical, LucidePencil, LucideSquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketsIcn } from '@/features/constants';
import { TicketMoreMenu } from './ticket-more-menu';
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketWithMetadata } from '../types';


type ticketItemProps={
    ticket: TicketWithMetadata;
    isDetail ?:boolean;
    attachments?: React.ReactNode;
    referencedTickets?: React.ReactNode;
    comments?:React.ReactNode;
}

export  const TicketItem =  ({ticket, isDetail, 
    attachments, referencedTickets,comments} : ticketItemProps) => {

    const detailButton= ticket.isOwner ? (
                <Button asChild variant='outline' size='icon' >
            <Link prefetch
                href={ticketPath(ticket.id)} 
                 >
                <LucideSquareArrowOutUpRight  className='h-4 w-4'/>
            </Link>
        </Button> 
    ): null;

    const editButton= ticket.isOwner ? (
        <Button variant="outline" size='icon' asChild>
            <Link  href={ticketEditPath(ticket.id)} >
                <LucidePencil className='w-4 h-4' />
            </Link>
        </Button>
    ): null ;

    const moreMenu=  ticket.isOwner ? ( <TicketMoreMenu ticket={ticket} trigger={ 
            <Button variant='outline' size='icon'>
                <LucideMoreVertical className="h-4 w-4" />
            </Button>} >
            </TicketMoreMenu> ) : null; 

 

    return ( 
    <div  className={clsx('w-full flex flex-col gap-y-4', {
            'max-w-[580px]': isDetail,
            'max-w-[420px]': !isDetail,
        })}>
        <div className='flex gap-x-2' >
            <Card className='w-full  max-w-[420px]'>
                <CardHeader>
                    <CardTitle className=' flex gap-x-2 truncate' >
                    <span>{TicketsIcn[ticket.status]}</span>
                    <span>{ticket.title}</span> 
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <span className={clsx("whitespace-break-spaces",{
                        "line-clamp-3": !isDetail,
                    })}>
                        {ticket.content}
                    </span>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                    {ticket.deadline} by {ticket.user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {toCurrencyFromCent(ticket.bounty) }
                    </p>
                </CardFooter>
            </Card>
        <div className='flex flex-col gap-y-1' >
                { isDetail ? (<> {editButton} {moreMenu}</>) : 
                            (<>{detailButton} {editButton} </>)}
        </div>
        </div>
        {isDetail ? 
         (<Suspense fallback={
         <div className='flex flex-col gap-y-4' >
            <Skeleton className='h-[250px] w-full' />
            <Skeleton className='h-[80px] ml-8' />
            <Skeleton className='h-[80px] ml-8' />
         </div>} >
            {attachments}
            {referencedTickets}
            {comments}
          </Suspense>): null}
    </div>
     );
}
 