import {Placeholder} from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import { projectsPath } from "@/path";
import Link from "next/link";

export default function NotFound()  {
    return ( 
        <Placeholder label="We could not find your projects"
         button={
            <Button asChild variant="outline" >
                <Link href={projectsPath()} >Go To Projects</Link>
            </Button>
            } 
        />
     );
}