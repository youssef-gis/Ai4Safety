import { SupplementEntity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateAttachmentArgs = {
  name: string;
  entity: SupplementEntity;
  entityId: string;
  url: string | null;
};

export const createAttachment = async ({
  name,
  entity,
  entityId,
  url
}: CreateAttachmentArgs) => {
  
  return await prisma.supplement.create({
    data: {
      name,
      ...(entity === "INSPECTION" ? { inspectionId: entityId } : {}),
      ...(entity === "ANALYSIS" ? { analysisId: entityId } : {}),
      ...(entity === "COMMENT" ? { commentId: entityId } : {}),
      entity,
      url
    },
  });
};