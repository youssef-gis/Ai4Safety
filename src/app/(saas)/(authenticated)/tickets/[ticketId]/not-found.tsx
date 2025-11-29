import {Placeholder} from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import { ticketsPath } from "@/path";
import Link from "next/link";

export default function NotFound()  {
    return ( 
        <Placeholder label="We could not find your ticket"
         button={
            <Button asChild variant="outline" >
                <Link href={ticketsPath()} >Go To Tickets</Link>
            </Button>
            } 
        />
     );
}