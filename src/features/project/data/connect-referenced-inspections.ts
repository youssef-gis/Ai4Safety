import { prisma } from "@/lib/prisma";

export const connectReferencedInspections = async (
  inspectionId: string,
  inspectionIds: string[]
) => {
  await prisma.inspection.update({
    where: {
      id: inspectionId,
    },
    data: {
      referencedInspections: {
        connect: inspectionIds.map((id) => ({
          id,
        })),
      },
    },
  });
};