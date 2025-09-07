import React, { cloneElement, useActionState, useEffect, useRef, useState } from "react";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button";
import { ActionState, EMPTY_ACTION_STATE } from "./forms/utils/to-action-state";
import { toast } from "sonner";
import { useActionFeedBack } from "./forms/hooks/use-actions-feedback";


type ConfirmDialogProps = {
    title ?: string;
    description ?: string;
    action: () =>  Promise<ActionState>;
    trigger: React.ReactElement<React.HTMLAttributes<HTMLElement>> | 
    ( (isPending: boolean)=> React.ReactElement<React.HTMLAttributes<HTMLElement>> ) ;
    onSuccess?: (actionState: ActionState) => void;
};
 
const useConfirmDialog = ({
    title='Are you absolutely sure?',
    description='This action cannot be undone.',
    action, trigger, onSuccess}: ConfirmDialogProps) => {
    
    const [isOpen, setIsOpen] = useState(false);

    const [actionState, formAction, isPending]= useActionState(action, EMPTY_ACTION_STATE)

    const dialogTrigger = cloneElement( typeof trigger === 'function' ? 
        trigger(isPending): trigger, {
        onClick: () => setIsOpen((state)=> !state),
    });

    const toastRef = useRef<string | number | null>(null);
    
    useEffect(()=>{
        if(isPending){
            toastRef.current = toast.loading('Deleting ...');
        } else if(toastRef.current){
            toast.dismiss(toastRef.current);
        }
        return () => {
            if(toastRef.current){
                toast.dismiss(toastRef.current);
            }
        }
    }, [isPending])

    useActionFeedBack(actionState, {
        onSuccess:({actionState})=>{
            if (actionState.message){
                toast.success(actionState.message);
            }
            onSuccess?.(actionState);
           },
        onError:({actionState})=>{
            if (actionState.message){
                toast.error(actionState.message);
                
            }  
        },
    });
    const dialog= (
        <AlertDialog open= {isOpen} onOpenChange={setIsOpen} >
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                    <form action={formAction}>
                        <Button type="submit" >Confirm</Button>
                    </form>
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
    
    return [dialogTrigger, dialog];
};


export {useConfirmDialog};

