import EmailVerification from "@/emails/auth/email-verification";
import { resend } from "@/lib/resend"

export const sendEmailVerification = async (username: string,
    email: string,
    code: string
) => {
    return await resend.emails.send({
        from:'no-reply@updates.offerjet.store',
        to: email,
        subject: "Email Verification",
        react: <EmailVerification toName={username} code={code} />
    });
}