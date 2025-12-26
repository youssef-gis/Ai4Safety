"use server";


import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import * as attachmentData from "../data";
import * as attachmentSubjectDTO from "../dto/attachment-subject-dto";
import { formErrorToActionState, toActionState } from "@/components/forms/utils/to-action-state";
import { IsOwner } from "@/features/auth/utils/is-owner";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";

export const deleteAttachment = async (id: string) => {
  const { user } = await getAuthOrRedirect();

  const attachment = await attachmentData.getAttachment(id);

  let subject;
  switch (attachment?.entity) {
    case "INSPECTION":
      subject = attachmentSubjectDTO.fromInspection(attachment.inspection);
      break;
    case "ANALYSIS":
      subject = attachmentSubjectDTO.fromAnalysis(attachment.analysis);
      break;
    case "COMMENT":
      subject = attachmentSubjectDTO.fromComment(attachment.comment);
      break;
  }

  if (!subject || !attachment) {
    return toActionState("Error", "Subject not found");
  }

  if (!IsOwner(user, subject)) {
    return toActionState("Error", "Not authorized");
  }

  try {
    if (!subject.organizationId) {
    throw new Error("Organization ID is required to delete attachment");
    }
    await prisma.supplement.delete({
      where: {
        id,
      },
    });

    await inngest.send({
      name: "app/supplement.deleted",
      data: {
        organizationId: subject.organizationId,
        projectId: subject.projectId,
        entityId: subject.entityId,
        entity: attachment.entity,
        fileName: attachment.name,
        attachmentId: attachment.id,
      },
   });
  } catch (error) {
    return formErrorToActionState(error);
  }

  return toActionState("Success", "Attachment deleted");
};