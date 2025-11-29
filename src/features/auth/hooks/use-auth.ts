import {  usePathname } from "next/navigation";
import { getAuth } from "@/features/auth/queries/get-auth";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";

const useAuth = ()=>{
    const [user, setUser]= useState<User | null>(null);
        const[isFetched, setFetch]= useState(false);
        const pathname= usePathname();

        useEffect(() => {
            const fetchUser= async () => {
            const { user }= await getAuth(); 
            setUser(user);
            setFetch(true);
            };

            fetchUser();
        }, [pathname]);

    return {user, isFetched};
};

export {useAuth}

