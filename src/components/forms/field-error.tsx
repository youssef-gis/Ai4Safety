import { ActionState } from "./utils/to-action-state";

type FieldsErrorProp= {
    actionState: ActionState;
    name: string;
}

const FieldErrorMsg = ({actionState, name}: FieldsErrorProp) => {

    const msg= actionState.fieldErrors[name]?.[0];
    if (!msg) return null;
    console.log(actionState.fieldErrors[name])

    return ( 
        <span className="text-xs  text-red-500" >
            {msg}
        </span>
     );
}

export {FieldErrorMsg};