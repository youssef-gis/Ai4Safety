import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user";
import { OrganizationSwichButton } from "./organization-switch-button";
import { Button } from "@/components/ui/button";
import { 
    LucideArrowLeftRight, 
    LucideArrowUpRightFromSquare, 
    LucidePen } from "lucide-react";
import { SubmitButton } from "@/components/forms/submit-buttton";
import { OrganizationDeleteButton } from "./organization-delete-button";
import Link from "next/link";
import { membershipsPath } from "@/path";
import { MembershipDeleteButton } from "@/features/membership/components/membership-delete-button";

type OrganizationListProps = {
    limitedAccess?: boolean;
}

export const OrganizationList = async ({limitedAccess}: OrganizationListProps) => {
    
    const organizations = await getOrganizationsByUserId();
    const hasActive= organizations.some((org)=>org.membershipByUser.isActive)
    
    return ( 
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Joined At</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>My Role</TableHead>
                    <TableHead/>
                </TableRow>
            </TableHeader>
            <TableBody>
            {organizations.map((organization)=>{

                const isActive= organization.membershipByUser.isActive;
                const isAdmin = organization.membershipByUser.membershipRole === 'ADMIN';

                const switchButton= (
                    <OrganizationSwichButton organizationId={organization.id} 
                    trigger={
                    <SubmitButton 
                        variant={!hasActive? "secondary" : isActive ? "default":"outline"}
                        icon={<LucideArrowLeftRight className="h-4 w-4"/> }
                        label={!hasActive? "Activate" :  isActive ? 'Active': 'Switch'} 
                    />
                    } 
                    
                    />

                );

                const detailButton= (
                    <Button variant="outline" size="icon" asChild>
                        <Link href={membershipsPath(organization.id)} >
                            <LucideArrowUpRightFromSquare className="h-4 w-4" />                        
                        </Link>
                    </Button>
                );

                const editButton= (
                    <Button variant="outline" size="icon">
                        <LucidePen className="h-4 w-4" />
                    </Button>
                );

                const leaveButton= (
                        <MembershipDeleteButton 
                            organizationId= {organization.id}
                            userId= {organization.membershipByUser.userId}
                        />);

                const deleteButton= (
                    <OrganizationDeleteButton 
                        organizationId={organization.id}
                    />
                );

                const placeholder = (
                    <Button size='icon' disabled 
                            className="disabled:opacity-0" 
                    />
                );

                const buttons= (
                    <>
                        {switchButton}
                        {limitedAccess ? null : isAdmin ? detailButton : placeholder}
                        {limitedAccess ? null :  isAdmin ? editButton : placeholder}
                        {limitedAccess ? null : leaveButton}
                        {limitedAccess ? null :  isAdmin ?  deleteButton : placeholder}
                    </>
                );

                return (
                    <TableRow key={organization.id} >
                        <TableCell>{organization.id}</TableCell>
                        <TableCell>{organization.name}</TableCell>
                        <TableCell>
                            {format(organization.membershipByUser.joinedAt,
                                "yyyy-MM-dd"
                            )}</TableCell>
                        <TableCell>{organization._count.memberships}</TableCell>
                        <TableCell>{organization.membershipByUser.membershipRole}</TableCell>
                        <TableCell className="flex justify-end gap-x-2" >
                            {buttons}
                        </TableCell>
                    </TableRow>
                );

            })
            }
            </TableBody>

        </Table>
     );
};