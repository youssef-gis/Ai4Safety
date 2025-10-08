'use client';
import { useQueryState } from "nuqs";
import { searchParser } from "../search-params";
import { SearchInput } from "@/components/search-input";

type ProjectSearchInputProps={
    placeholder: string
    }

export const ProjectSearchInput = ({placeholder}: ProjectSearchInputProps) => {

    const [search,  setSearch]= useQueryState('search', searchParser)

    return ( 
        <SearchInput 
            placeholder={placeholder} 
            value={search}
            onChange={setSearch} />
     );
}