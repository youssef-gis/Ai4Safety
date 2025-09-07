'use client';
import { useEffect, useRef } from "react";
import { ActionState } from "../utils/to-action-state";

type OnArgs = {
    actionState: ActionState;
}

type UseActionsFeedBackOptions = {
    onSuccess?: (onArgs: OnArgs)=> void;
    onError?: (onArgs: OnArgs)=> void;
}

const useActionFeedBack = (actionState: ActionState,
     options: UseActionsFeedBackOptions) => {
    
    const prevTimestamp = useRef(actionState.timestamp);
    const isUpdate =prevTimestamp.current  !== actionState.timestamp;
    
    useEffect(()=>{
        if(!isUpdate) return;

        if(actionState.status === 'Success'){
            //options.onSuccess?.(); 
            if(options.onSuccess){
                options.onSuccess({actionState}); 
            }
        } 
        if(actionState.status === 'Error'){
             //options.onError?.(); 
            if(options.onError){
                options.onError({actionState});
            }
        }

        prevTimestamp.current = actionState.timestamp;

    }, [isUpdate, actionState, options])
    
};

export { useActionFeedBack };