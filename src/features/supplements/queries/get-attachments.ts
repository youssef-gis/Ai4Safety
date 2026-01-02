import { SupplementEntity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getAttachments = async (
  entityId: string,
  entity: SupplementEntity
) => {
  switch (entity) {
    case "INSPECTION": {
      return await prisma.supplement.findMany({
        where: {
          inspectionId: entityId,
        },
      });
    }
    case "ANALYSIS": {
      return await prisma.supplement.findMany({
        where: {
          analysisId: entityId,
        },
      });
    }
    case "DETECTION": {
      return await prisma.supplement.findMany({
        where: {
          detectionId: entityId,
        },
      });
    }
    case "COMMENT": {
      return await prisma.supplement.findMany({
        where: {
          commentId: entityId,
        },
      });
    }
    default:
      return [];
  }
};