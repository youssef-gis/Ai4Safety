'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { passwordPath, profilePath } from "@/path";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AccountTabs = () => {
     const pathName= usePathname();
    return ( 
        <Tabs value={pathName.split('/').at(-1)} >
            <TabsList>
                <TabsTrigger value="profile" asChild >
                    <Link href={profilePath()} >Profile</Link>
                </TabsTrigger>
                <TabsTrigger value="password" asChild >
                    <Link href={passwordPath()} >Password</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
     );
}

