import { prisma } from "@/lib/prisma";

export const disconnectReferencedInspections = async (
  inspectionId: string,
  inspectionIds: string[]
) => {
  await prisma.inspection.update({
    where: {
      id: inspectionId,
    },
    data: {
      referencedInspections: {
        disconnect: inspectionIds.map((id) => ({
          id,
        })),
      },
    },
  });
};