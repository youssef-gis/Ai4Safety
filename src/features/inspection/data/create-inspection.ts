import { AnalysisType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateInspectionArgs = {
  id: string;
  userId: string;
  projectId: string;
  inspectionDate: string;
  title:string;
  jobs:AnalysisType[];
};

type IncludeOptions = {
  //includeUser?: boolean;
  includeProject?: boolean;
};

export async function createInspection<T extends IncludeOptions>({
  id,
  userId,
  projectId,
  inspectionDate,
  title,
  jobs,
  options,
}: CreateInspectionArgs & { options?: T }) {

  const include = {
    ...(options?.includeProject && { project: true }),
  };

  const inspection = await prisma.inspection.create({
    data: {
      id,
      title,
      conductedByUserId:userId,
      projectId,
      inspectionDate,
      job:{
          create:jobs.map((job)=>({type: job})),
          
            }},
    include
});

  return inspection ;
}