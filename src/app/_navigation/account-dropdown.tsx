import { User as AuthUser   } from "@prisma/client";
import { signOut } from "@/features/auth/actions/sign-out";
import {  LucideGem, LucideLock, LucideLogOut, LucideUser } from "lucide-react";
import { DropdownMenu } from "../../components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { passwordPath, pricingPath, profilePath } from "@/path";
import Link from "next/link";

type AccountDropDownProps={
    user: AuthUser
}

export const AccountDropdown = ({user}: AccountDropDownProps) => {
    return ( 
            <DropdownMenu>
                <DropdownMenuTrigger asChild >
                    <Avatar>
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                    <Link href={profilePath()}>
                        <LucideUser className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href={passwordPath()}>
                        <LucideLock className="mr-2 h-4 w-4" />
                        <span>Password</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href={pricingPath()}>
                            <LucideGem className="mr-2 h-4 w-4" />
                            <span>Pricing</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <form action={signOut}>
                        <LucideLogOut className="mr-2 h-4 w-4" />
                        <button type="submit">Sign Out</button>
                    </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        
     );
}