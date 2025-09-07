import EmailPasswordReset from "@/emails/password/email-password-reset"
import { resend } from "@/lib/resend"

export const sendEmailPasswordResend = async (username: string,
    email: string,
    passwordResetLink: string
) => {
    return await resend.emails.send({
        from:'no-reply@updates.offerjet.store',
        to: email,
        subject: "Password Reset From Ai4Safety",
        react: <EmailPasswordReset toName={username} url={passwordResetLink} />
    });
}