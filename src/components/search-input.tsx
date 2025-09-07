'use client';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import {useDebouncedCallback} from 'use-debounce' ; 
import { searchParser } from "@/features/ticket/search-params";
import {useQueryState} from 'nuqs';

type SearchInputProps={
    placeholder: string;
    value: string;
    onChange:(value: string)=>void;
}

export const SearchInput = ({placeholder, value, onChange}: SearchInputProps) => {


    const handleSearch= useDebouncedCallback((event: React.ChangeEvent<HTMLInputElement>)=>{

        onChange(event.target.value)
    }, 300)
    return ( 
        <Input defaultValue={value}
         placeholder={placeholder} onChange={handleSearch} />
    );
    
}