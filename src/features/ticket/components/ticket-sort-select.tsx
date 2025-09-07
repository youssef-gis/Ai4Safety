'use client';
import { SortSelect, SortSelectOptions } from "@/components/sort-select";
import { useQueryStates } from "nuqs";
import { sortOptions, sortParser } from "../search-params";

type TicketSortSelectOptions = {
    options: SortSelectOptions[];
    

}

export const TicketSortSelect = ({options}: TicketSortSelectOptions) => {
    const [sort, setSort]= useQueryStates(sortParser, sortOptions);
    return ( 
        <SortSelect options={options} value={sort} onChange={setSort} />
     );
}