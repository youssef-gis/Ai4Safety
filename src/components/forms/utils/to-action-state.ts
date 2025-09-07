import { ZodError } from "zod";

export type ActionState <T = undefined> = {
     status?: 'Success' | 'Error';
     message:string; 
     payload?: FormData;
     fieldErrors: Record<string, string[] | undefined>;
     timestamp: number;
     data?:T;
};

export const EMPTY_ACTION_STATE: ActionState = {
     message: '',
     fieldErrors: {},
     timestamp: Date.now(),
};

export const formErrorToActionState = (
    error: unknown,
    formData?: FormData
): ActionState => {

     if(error instanceof ZodError){
           const zodError = error as ZodError;
          return {
               status: 'Error',
               message: '',
               fieldErrors: zodError.flatten().fieldErrors,
               payload: formData,
               timestamp: Date.now(),
          };
          
     } else if ( error instanceof Error){
          return {
               status: 'Error',
               message: error.message,
               fieldErrors: {},
               payload: formData,
               timestamp: Date.now(),
          };
     }
     
     else {
          return {
               status: 'Error',
               message: "An unknown error went wrong", 
               fieldErrors: {},
               payload: formData,
               timestamp: Date.now(),
          };
     }

    };
 
export const toActionState = ( status: ActionState['status'] ,
     message:string,  formData?: FormData, data?:unknown ):ActionState =>{
     return {status ,message,
           fieldErrors: {},payload: formData,
           timestamp: Date.now(),}
}