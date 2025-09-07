import { toast, ToastT } from "sonner";
import { useActionFeedBack } from "./hooks/use-actions-feedback";
import { ActionState } from "./utils/to-action-state";

type FormProps= {
    action: (payload: FormData)=>void;
    actionState: ActionState;
    children: React.ReactNode;
    onSuccess? : (actionState: ActionState) => void;
    onError? : (actionState: ActionState) => void;
    toastOptions?: Omit<ToastT, "id"> | undefined;
}

const Form = ({action, actionState, children,
    onSuccess, onError, toastOptions}: FormProps) => {
    useActionFeedBack(actionState, {
        onSuccess:({actionState})=>{
            if (actionState.message){
                toast.success(actionState.message, toastOptions);
            }
            onSuccess?.(actionState);
           },
        onError:({actionState})=>{
            if (actionState.message){
                toast.error(actionState.message, toastOptions);
                
            }
            onError?.(actionState); 
        },
    });
    return ( 
        <form action={action} 
            className="flex flex-col gap-y-2" >
                {children}
        </form>
     );
}

export {Form};