import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetLink } from "../utils/generate-password-reset-link";
import { sendEmailPasswordResend } from "../emails/send-email-password-resend";

export type PasswodResetEventArgs={
    data:{
        userId: string;
    }
}

export const passwordResetEvent = inngest.createFunction(
    {id:'password-reset'},
    {event: 'app/password.password-reset'},
    async ({event}) =>{
        const {userId} = event.data;

        const user = await prisma.user.findUniqueOrThrow({
            where: {id: userId},
        }
        );

        const passwordResetLink = await generatePasswordResetLink(user.id);

        const result= await sendEmailPasswordResend(user.username, user.email, passwordResetLink)

        if(result.error){
            throw new Error(`${result.error.name}: ${result.error.message}`);
        };

        return {event, body: result};

    }
)