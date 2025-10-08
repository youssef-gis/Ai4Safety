import { Comment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findIdsFromText } from "@/utils/find-ids-from-text";

export const disconnectReferencedInspectionsViaComment = async (
  comment: Comment
) => {
  const inspectionId = comment.inspectionId;
  const inspectionIds = findIdsFromText("inspections", comment.content);

  if (!inspectionIds.length || !inspectionId) return;

  const comments = await prisma.comment.findMany({
    where: {
      inspectionId: comment.inspectionId,
      id: {
        not: comment.id,
      },
    },
  });

  const allOtherContent = comments.map((comment) => comment.content).join(" ");

  const allOtherInspectionIds = findIdsFromText("inspections", allOtherContent);

  const inspectionIdsToRemove = inspectionIds.filter(
    (inspectionId) => !allOtherInspectionIds.includes(inspectionId)
  );

  await prisma.inspection.update({
    where: {
      id: inspectionId,
    },
    data: {
      referencedInspections: {
        disconnect: inspectionIdsToRemove.map((id) => ({
          id,
        })),
      },
    },
  });
};