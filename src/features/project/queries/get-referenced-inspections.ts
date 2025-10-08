import { prisma } from "@/lib/prisma";

export const getReferencedInspections = async (inspectionId: string) => {
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      referencedInspections: true,
    },
  });

  return inspection?.referencedInspections ?? [];
};