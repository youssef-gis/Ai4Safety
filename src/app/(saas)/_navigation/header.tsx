'use client';
import { homePath, signInPath, signUpPath } from "@/path";
import Link from "next/link";
import {  } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {  LucideKanban } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { AccountDropdown } from "./account-dropdown";

const Header =  () => {
    const {user, isFetched}= useAuth( );

    if(!isFetched){
        return null;
    }

    const navItems= user ? (
        <AccountDropdown user={user} />
        
    ) : (<> 
            <Link href={signUpPath()} className={buttonVariants({
                variant:'outline',})} >Sign Up
            </Link>   
            <Link href={signInPath()} className={buttonVariants({
                variant:'outline',})} >Sign In
            </Link>   
        </>
    )
    return ( 
        <>
            <nav className="flex justify-between items-center px-5 border-b h-[60px]" >
                <div>
                    <Link href={homePath()} className={buttonVariants({
                    variant:'ghost',
                    })} >
                    <LucideKanban />
                    <h1 className="ml-2 text-lg font-semibold" >Ai4Safety</h1>
                    </Link>
                </div>
                <div className="flex gap-x-1 items-center" >
                    <ThemeSwitcher />
                    {navItems}
                </div>
            </nav>
        </>
     );
}
 
export default Header;