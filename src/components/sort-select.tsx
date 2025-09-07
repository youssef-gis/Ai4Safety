'use client';

import { Select, SelectContent, SelectItem,
         SelectTrigger, SelectValue } from "./ui/select";

         

export type SortSelectOptions={
    sortKey: string,
    sortValue:string,
    label: string,
};

type SortObject={
    sortKey: string;
    sortValue: string;
}


type SortInputProps={
    options:SortSelectOptions[];
    value: SortObject;
    onChange:(sort: SortObject)=>void;
};


export const SortSelect = ({ options, value, onChange}: SortInputProps) => {


    const handleSort=(compositeKey: string)=>{
        const[sortKey, sortValue] = compositeKey.split('_')
        onChange({
            sortKey,
            sortValue,
        })
    }
    return ( 
        <Select defaultValue={value.sortKey + '_' + value.sortValue}  
        onValueChange={handleSort} >
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((option)=>(
                    <SelectItem key={option.sortKey + option.sortValue} 
                        value={option.sortKey +'_'+ option.sortValue} >
                        {option.label}
                    </SelectItem>
                )
              )
            }
            </SelectContent>
        </Select>
    );
    
}