"use server";

import { SupplementEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { filesSchema } from "../schema/files";
import * as attachmentService from "../service";
import { IsOwner } from "@/features/auth/utils/is-owner";

import { inspectionsPath } from "@/path";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { ActionState, formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";

const createAttachmentsSchema = z.object({
  files: filesSchema.refine((files) => files.length !== 0, "File is required"),
});

type CreateAttachmentsArgs = {
  entityId: string;
  entity: SupplementEntity;
};

export const createAttachments = async (
  { entityId, entity }: CreateAttachmentsArgs,
  _actionState: ActionState,
  formData: FormData
) => {
  const { user } = await getAuthOrRedirect();

  const subject = await attachmentService.getAttachmentSubject(
    entityId,
    entity
  );

  if (!subject) {
    return toActionState("Error", "Subject not found");
  }

  if (!IsOwner(user, subject)) {
    return toActionState("Error", "Not the owner of this subject");
  }

  try {

    const { files } = createAttachmentsSchema.parse({
      files: formData.getAll("files"),
    });

    await attachmentService.createAttachments({
      subject,
      entity,
      entityId,
      files,
    });
  } catch (error) {
    return formErrorToActionState(error);
  }

  if (subject.inspectionId) {
    revalidatePath(inspectionsPath(subject.inspectionId));
  }

  return toActionState("Success", "Attachment(s) uploaded");
};