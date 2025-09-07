import { paginationData } from "./types";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { useTransition } from "react";
import { PAGE_SIZES } from "./constants";

type Page_Size={
    page: number,
    size: number,
};

type PaginationProps={
    pagination:Page_Size,
    onPagination:(page: Page_Size)=>void,
    paginationMetadata:paginationData<unknown>["metadata"],
}

export const Pagination = ({pagination, onPagination, paginationMetadata}: PaginationProps) => {
    const startOffset= pagination.page * pagination.size + 1;
    const endOffset = startOffset  - 1  + pagination.size;
    const actualEndOffset = Math.min(endOffset, paginationMetadata.count)
    const label = `${startOffset} - ${actualEndOffset} of ${paginationMetadata.count}`;

    const [isPending, startTransition]= useTransition()

    const handlePreviousPage =()=>{
        startTransition(()=>{
        onPagination({...pagination, page: pagination.page-1});
        })
    };

    const handleChangeSize = (size: string)=>{
        onPagination({page: 0, size:parseInt(size)})
    }

    const prevButton = (
        <Button variant='outline'
        size='sm'
        disabled={pagination.page < 1 || isPending}
        onClick={handlePreviousPage} 
        >
        Previous
        </Button>
    );
    const handleNextPage =()=>{
        startTransition(()=>{
        onPagination({...pagination, page: pagination.page+1})
        })
    }
    const nextButton = (
        <Button variant='outline'
        size='sm'
        disabled={!paginationMetadata.hasNextPage || isPending }
        onClick={handleNextPage} 
        >
        Next
        </Button>
    );

    const sizeButton =(
        <Select defaultValue={pagination.size.toString()} 
           onValueChange={handleChangeSize}  >
            <SelectTrigger className="h-[36px]" >
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                    {size}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )

    return ( 
    <div className="flex justify-between items-center" >
        <p className="text-sm text-muted-foreground" >{label}</p>
        <div className="flex gap-x-2" >
            {sizeButton}
            {prevButton}
            {nextButton}
        </div>
    </div> );
}