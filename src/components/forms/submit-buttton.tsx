'use client';
import { useFormStatus } from "react-dom";
import { LucideLoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { cloneElement } from "react";

type SubmitButtonProps = {
  label?: string;
  icon?:  React.ReactElement<React.HTMLAttributes<HTMLElement>> ;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled: boolean
};


const SubmitButton = ({label, icon, variant='default', size='default', disabled= false}: SubmitButtonProps)=>{
    const {pending} = useFormStatus();

    return (
        <Button disabled={pending} type="submit" variant={variant} size={size} >
            {pending ? (
            <LucideLoaderCircle className="h-4 w-4 animate-spin"/>
            ): icon ? (
                <>
                {cloneElement(icon, {className: 'h-4 w-4',})}
                </>
            ): null  }    
            {label}
        </Button>
    );
};

export { SubmitButton };