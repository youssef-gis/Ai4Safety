import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { LucideBan, LucideCheck } from "lucide-react";
import { getMemberships } from "../queries/get-memberships";
import { MembershipDeleteButton } from "./membership-delete-button";
import { MembershipMoreMenu } from "./membership-more-menu";
import {PermissionToggle} from './permission-toggle';
import { Badge } from "@/components/ui/badge";
import { PermissionManager } from "./permission-manager";

type MembershipListPageProp = {
    organizationId: string;
}
export const MembershipList = async({organizationId}:MembershipListPageProp) => {
    const memberships = await getMemberships(organizationId);
    
    return ( 
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined At</TableHead>
                    <TableHead>Verifed Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead >Permissions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {memberships.map((membership)=>{
                    const isAdmin = membership.membershipRole === 'ADMIN';
                    const membershipMoreMenu= (
                        <MembershipMoreMenu
                            organizationId= {membership.organizationId}
                            userId= {membership.userId}
                            membershipRole= {membership.membershipRole}
                        />
                    )
                    const deleteButton= (
                        <MembershipDeleteButton 
                            organizationId= {membership.organizationId}
                            userId= {membership.userId}
                        />
                    )
                    // {membershipMoreMenu}
                    const buttons= <>
                                    {deleteButton}</>;
                    return(
                        <TableRow key={membership.userId} >
                            <TableCell>{membership.user.username}</TableCell>
                            <TableCell>{membership.user.email}</TableCell>
                            <TableCell>
                                {format(membership.joinedAt , "yyyy-MM-dd, HH:mm")}
                            </TableCell>
                            <TableCell>
                                {membership.user.emailVerified ? (
                                    <LucideCheck className="h-4 w-4" />
                                ): (
                                    <LucideBan className="h-4 w-4" />
                                )}
                            </TableCell>
                            <TableCell>                                
                                <Badge variant={isAdmin ? "default" : "secondary"}>
                                    {membership.membershipRole}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {/* <PermissionToggle
                                    userId={membership.userId}
                                    organizationId={membership.organizationId}
                                    permissionKey="canDeleteProject"
                                    permissionValue= {membership.canDeleteProject}
                                /> */}
                                {isAdmin ? (
                                    <span className="text-xs text-muted-foreground italic">
                                        Full Access
                                    </span>
                                ) : (
                                    <PermissionManager 
                                        membership={membership}
                                        isAdmin={isAdmin}
                                    />
                                )}
                            </TableCell>
                            <TableCell className="flex justify-end gap-x-2">
                                {buttons}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
     );
}