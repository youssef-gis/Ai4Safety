"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminOrRedirect } from "@/features/membership/queries/get-admin-or-redirect";

import { ActionState, formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { credentialsPath } from "@/path";
import { generateCredential } from "../utils/generate-credential";

const createCredentialSchema = z.object({
  name: z.string().min(1, { message: "Is required" }).max(191),
});

export const createCredential = async (
  organizationId: string,
  _actionState: ActionState,
  formData: FormData
) => {
  await getAdminOrRedirect(organizationId);

  let secret;

  try {
    const { name } = createCredentialSchema.parse({
      name: formData.get("name"),
    });

    secret = await generateCredential(organizationId, name);
  } catch (error) {
    return formErrorToActionState(error);
  }

  revalidatePath(credentialsPath(organizationId));

  return toActionState(
    "Success",
    `Copy the secret, we will not show it again: ${secret}`
  );
};