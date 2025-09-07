import Heading from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { TicketLisT } from "@/features/ticket/components/ticket-list";
import { searchParamsCache } from "@/features/ticket/search-params";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

type HomePageProps = {
  searchParams: SearchParams;
}

export default function Home({searchParams}: HomePageProps) {
  return (
    <div className="flex-1 flex flex-col gap-y-8">
    
    <Heading title='Tickets Page' 
            description='All tickets in one place' />
    
            <Suspense fallback={<Spinner />}>
                {/* @ts-expect-error Async Server Component */}
                <TicketLisT searchParams={searchParamsCache.parse(searchParams)} />
            </Suspense>
    </div>
  );
}
