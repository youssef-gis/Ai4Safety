import Heading from "@/components/heading";
import { Spinner } from "@/components/spinner";

import { searchParamsCache } from "@/features/ticket/search-params";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";

type HomePageProps = {
  searchParams: SearchParams;
}

export default function Home({searchParams}: HomePageProps) {
  return (
    <div className="flex-1 flex flex-col gap-y-8">
    
    <Heading title='Ai4Safety' 
            description='All your inspections in one place' 
    />
    <p>Landing Page</p>
    

            
    </div>
  );
}
