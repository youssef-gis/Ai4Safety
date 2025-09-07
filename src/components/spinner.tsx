import { LucideLoaderCircle } from "lucide-react";

export const Spinner = () => {
    return ( 
        <div className="flex-1 flex  flex-col items-center self-center" >
            <LucideLoaderCircle className="h-16 w-16 animate-spin" />
        </div>
     );
}