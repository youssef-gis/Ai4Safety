import { Prisma } from "@prisma/client";

type AttachmentSubjectInspection = Prisma.InspectionGetPayload<{
  select: {
    id: true;
    projectId: true;
    conductedByUserId: true;
  };
  include:{
    project:{
      select:{
        organizationId:true;
      }
    }
  }
}>;

type AttachmentSubjectAnalysis = Prisma.AnalysisGetPayload<{
  select: {
    id: true;
    inspectionId: true;
    jobId: true;
  };
  include:{
    inspection:{
      include:{
        project:{
          select:{
            organizationId:true;
          }
        }
      }
    }
  }
}>;

type AttachmentSubjectComment = Prisma.CommentGetPayload<{
  include: {
    inspection: {
      select: {
        id: true;
        projectId: true;
        project:{
          select:{
            organizationId:true;
          };
        }; 
      };
    };
    
  };
}>;

export type AttachmentSubject =
  | AttachmentSubjectInspection
  | AttachmentSubjectAnalysis
  | AttachmentSubjectComment;

export const isInspection = (
  subject: AttachmentSubject
): subject is AttachmentSubjectInspection => {
  return "projectId" in subject  && "project" in subject;
};

export const isAnalysis = (
  subject: AttachmentSubject
): subject is AttachmentSubjectAnalysis => {
  return  "jobId" in subject;
};

export const isComment = (
  subject: AttachmentSubject
): subject is AttachmentSubjectComment => {
  return "content" in subject;
};