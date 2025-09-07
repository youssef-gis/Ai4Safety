'use client';
import { useQueryState } from "nuqs";
import { searchParser } from "../search-params";
import { SearchInput } from "@/components/search-input";

type TicketSearchInputProps={
    placeholder: string
    }

export const TicketSearchInput = ({placeholder}: TicketSearchInputProps) => {

    const [search,  setSearch]= useQueryState('search', searchParser)

    return ( 
        <SearchInput 
            placeholder={placeholder} 
            value={search}
            onChange={setSearch} />
     );
}