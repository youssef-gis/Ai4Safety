import EmailInvitation from "@/emails/invitation/email-invitation";
import { resend } from "@/lib/resend";

export const sendEmailInvitation = async (
  username: string,
  organizationName: string,
  email: string,
  emailInvitationLink: string
) => {
  return await resend.emails.send({
    from: "no-reply@updates.offerjet.store",
    to: email,
    subject: `Invitation to ${organizationName} from Ai4Safety`,
    react: (
      <EmailInvitation
        fromUser={username}
        fromOrganization={organizationName}
        url={emailInvitationLink}
      />
    ),
  });
};