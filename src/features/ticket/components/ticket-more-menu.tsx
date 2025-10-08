"use client";
import {  TicketStatus } from "@prisma/client";
import {  LucideTrash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react";
import { TicketStatusLabels } from "@/features/constants";
import { UpdateTicketStatus } from "../actions/update-ticket-status";
import { toast } from "sonner";
import { deleteTicket } from "../actions/delete-ticket";
import { useConfirmDialog } from "@/components/confirm-dialogue";
import { TicketWithMetadata } from "../types";

type TicketMoreMenuProps = {
    ticket: TicketWithMetadata;
    trigger: React.ReactNode;
}

const TicketMoreMenu = ({ticket, trigger}: TicketMoreMenuProps) => {
    console.log(ticket.permissions.canDeleteTicket)
    const [deleteButton, deleteDialog] = useConfirmDialog({
        action: deleteTicket.bind(null, ticket.id),
        trigger: (
            <DropdownMenuItem disabled={
                !ticket.permissions.canDeleteTicket
            } >
                <LucideTrash className="h-4 w-4 mr-2" />
                <span>Delete</span>
            </DropdownMenuItem>
            ),
        });
        

    const handleTicketStatus = async (status: string)=>{
        //console.log('Status changed to:', status);
        const promise=  UpdateTicketStatus(ticket.id, status as TicketStatus);

        toast.promise(promise, {
            loading:'Updating ticket status...',
        })

        const result= await promise;

        if(result.status === 'Success'){
            toast.success(result.message);

        } else if(result.status === 'Error'){
            toast.error(result.message);
        }
    }

    const ticketStatusRadioGroup = (
        <DropdownMenuRadioGroup value={ticket.status} 
            onValueChange={handleTicketStatus} >
            {(Object.keys(TicketStatusLabels) as Array<TicketStatus> ).map((key)=>(
                <DropdownMenuRadioItem key={key} value={key}>
                    {TicketStatusLabels[key]}
                </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
    )
    
    return (
    <>
    {deleteDialog} 
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right" align="start" >
        <DropdownMenuLabel>Ticket  Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ticketStatusRadioGroup}
        <DropdownMenuSeparator />
        {deleteButton}
      </DropdownMenuContent>
    </DropdownMenu>
    </>

     );
};

export { TicketMoreMenu };
