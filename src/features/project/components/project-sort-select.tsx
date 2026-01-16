'use client';
import { SortSelect, SortSelectOptions } from "@/components/sort-select";
import { useQueryStates } from "nuqs";
import { sortOptions, sortParser } from "../search-params";

type ProjectSortSelectOptions = {
    options: SortSelectOptions[];
}

export const ProjectSortSelect = ({options}: ProjectSortSelectOptions) => {
    const [sort, setSort]= useQueryStates(sortParser, sortOptions);
    return ( 
        <SortSelect options={options} value={sort} onChange={setSort} />
     );
}