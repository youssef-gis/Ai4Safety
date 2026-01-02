import { prisma } from "@/lib/prisma";

export const connectReferencedDefects = async (
  defectId: string,
  defectIds: string[]
) => {
  await prisma.detection.update({
    where: {
      id: defectId,
    },
    data: {
      referencedDetections: {
        connect: defectIds.map((id) => ({
          id,
        })),
      },
    },
  });
};