import { Placeholder } from "@/components/placeholder";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { LucideTrash } from "lucide-react";
import { getInvitations } from "../queries/get-invitations";
import { InvitationDeleteButton } from "./invitation-delete-button";

export const InvitationsList = async ({
    organizationId}:{organizationId:string}) => {
        const invitations  = await getInvitations(organizationId)
    if(!invitations.length){
        return <Placeholder label="No invitations for this organization"/>
    }
    return ( 
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Invited At</TableHead>
                    <TableHead>Invited By</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    invitations.map((invitation)=>{
                    const deleteBtn = (
                        <InvitationDeleteButton
                            email={invitation.email}
                            organizationId={invitation.organizationId}
                        />
                    );

                    const btns = <>{deleteBtn}</>;
                    return(
                        <TableRow key={invitation.email} >
                            <TableCell>{invitation.email}</TableCell>
                            <TableCell>
                                {format(invitation.createdAt, "yyyy-MM-dd, HH:mm")}
                            </TableCell>
                            <TableCell>
                                {invitation.invitedByUser
                                    ? `${invitation.invitedByUser.username} (${invitation.invitedByUser.email})`
                                    : "Deleted User"
                                }
                            </TableCell>
                            <TableCell className="flex justify-end gap-x-2" >
                                {btns}
                            </TableCell>
                        </TableRow>
                    );
                    })
                }
            </TableBody>
        </Table>
     );
}