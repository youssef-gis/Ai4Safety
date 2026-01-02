import { DetectionSeverity, DetectionStatus, DetectionType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateDefectArgs = {
  id: string;
  createdAt: Date;
  type: DetectionType;
  severity: DetectionSeverity;
  status: DetectionStatus;
  notes: string;
  locationOn3dModel: Prisma.InputJsonValue;
  annotation2D: Prisma.InputJsonValue;
  sourceImageId: string;
  analysisId: string;
};

type IncludeOptions = {
  includeAnalysis?: boolean;
};

export async function upsertDetection<T extends IncludeOptions>({
  id,
  createdAt,
  type,
  severity,
  status,
  notes,
  locationOn3dModel,
  annotation2D,
  sourceImageId,
  analysisId,
  options,
}: CreateDefectArgs & { options?: T }) {
  
  const include = {
    ...(options?.includeAnalysis && {
      analysis: {
        include: {
          inspection: {
            include: {
              project: true,
            },
          },
        },
      },
    }),
  };

  return prisma.detection.upsert({
    where: { id },
    update: {
      type,
      severity,
      status,
      notes,
      locationOn3dModel: locationOn3dModel ?? Prisma.DbNull,
      annotation2D: annotation2D ?? Prisma.DbNull,
      sourceImageId,
    },
    create: {
      id,
      createdAt,
      type,
      severity,
      status,
      notes,
      locationOn3dModel: locationOn3dModel ?? Prisma.DbNull,
      annotation2D: annotation2D ?? Prisma.DbNull,
      sourceImageId,
      analysisId,
    },
    include,
  });
}