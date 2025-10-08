'use client';
import { useQueryState, useQueryStates } from "nuqs";
import { paginationOptions, paginationParser, searchParser } from "../search-params";
import { useEffect, useRef } from "react";

import { ProjectWithMetadata } from "../types";
import { Pagination } from "@/components/pagination/pagination";
import { paginationData } from "@/components/pagination/types";

type ProjectPaginationProps =  {
    paginationProjectMetadata:paginationData<ProjectWithMetadata>['metadata']
}

export const ProjectPagination = ({paginationProjectMetadata}: ProjectPaginationProps) => {
    const[pagination, setPagination]= useQueryStates(paginationParser,
                                                    paginationOptions
                                                )
    const [search]= useQueryState('search', searchParser)
    const prevSearch= useRef(search);
    useEffect(()=>{
        if(search === prevSearch.current) return;
        prevSearch.current = search;

        setPagination({...pagination, page: 0});
    }, [pagination, search, setPagination]);

    return ( 
        <Pagination pagination={pagination} 
            onPagination={setPagination}
            paginationMetadata={paginationProjectMetadata} />
     );
}