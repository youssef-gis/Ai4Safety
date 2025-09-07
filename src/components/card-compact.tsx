import { Card, 
CardContent, 
CardDescription, 
CardFooter, 
CardHeader, CardTitle } from "./ui/card";

type CardElemProps = {
title: string;
description: string;
content: React.ReactNode;
className?: string;
footer?: React.ReactNode;
}

export const CardElement = ({title, description, 
    content, className, footer}:CardElemProps ) => {
    return ( 
    <Card className={className} >
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
                    {content}
        </CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
     );
}