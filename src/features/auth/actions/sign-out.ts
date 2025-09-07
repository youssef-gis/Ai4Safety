'use server';

import { redirect } from "next/navigation"
import { getAuth } from "../queries/get-auth"
import { signInPath } from "@/path"
import {invalidateSession} from '@/lib/lucia';
import { deleteSessionCookie } from "../utils/session-cookie";

const signOut =  async () => {
    const {session}= await getAuth()

    if(!session){
        redirect(signInPath());
    }

    await invalidateSession(session.id);
    await deleteSessionCookie();

    redirect(signInPath());
};

export {signOut}