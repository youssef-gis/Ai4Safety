"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";
import { getStripeProvisioningByOrganization } from "@/features/stripe/queries/get-stripe-provisioning";
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { invitationsPath } from "@/path";
import { ActionState, formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { generateInvitationLink } from "../utils/generate-invitation-link";

const createInvitationSchema = z.object({
  email: z.string().min(1, { message: "Is required" }).max(191).email(),
});

export const createInvitation = async (
  organizationId: string,
  _actionState: ActionState,
  formData: FormData
) => {
  const { user } = await getAdminOrRedirect(organizationId);

  const { allowedMembers, currentMembers } =
    await getStripeProvisioningByOrganization(organizationId);

  if (allowedMembers <= currentMembers) {
    return toActionState(
      "Error",
      "Upgrade your subscription to invite more members"
    );
  }

  try {
    const { email } = createInvitationSchema.parse({
      email: formData.get("email"),
    });

    const targetMembership = await prisma.membership.findFirst({
      where: {
        organizationId,
        user: {
          email,
        },
      },
    });

    if (targetMembership) {
      return toActionState(
        "Error",
        "User is already a member of this organization"
      );
    }

    const emailInvitationLink = await generateInvitationLink(
      user.id,
      organizationId,
      email
    );

    await inngest.send({
      name: "app/invitation.created",
      data: {
        userId: user.id,
        organizationId,
        email,
        emailInvitationLink,
      },
    });
  } catch (error) {
    return formErrorToActionState(error);
  }

  revalidatePath(invitationsPath(organizationId));

  return toActionState("Success", "User invited to organization");
};