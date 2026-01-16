import { SupplementEntity } from "@prisma/client";
import { AttachmentSubject, isComment, isInspection, isAnalysis, isDetection } from "../types";

export type Type = {
  entityId: string;
  entity: SupplementEntity;
  organizationId: string;
  projectId: string;
  userId: string | null;
  inspectionId: string;
  commentId: string | null;
};

export const fromInspection = (inspection: AttachmentSubject | null) => {
  if (!inspection || !isInspection(inspection)) {
    return null;
  }

  return {
    entity: "INSPECTION" as SupplementEntity,
    entityId: inspection.id,
    projectId: inspection.projectId,
    userId: inspection.conductedByUserId,
    inspectionId: inspection.id,
    organizationId: inspection.project.organizationId,
    commentId: null,
  };
};

export const fromAnalysis = (analysis: AttachmentSubject | null) => {
  if (!analysis || !isAnalysis(analysis)) {
    return null;
  }

  return {
    entity: "ANALYSIS" as SupplementEntity,
    entityId: analysis.id,
    analysisId: analysis.id,
    projectId: analysis.inspection.projectId,
    inspectionId: analysis.inspectionId,
    jobId: analysis.jobId,
    organizationId: analysis.inspection.project.organizationId,
    userId: analysis.inspection.conductedByUserId,
    // conductedByUserId: inspection.conductedByUserId,-()
    // inspectionId: inspection.id,
    commentId: null,
  };
};

export const fromDetection = (detection: AttachmentSubject | null) => {
  if (!detection || !isDetection(detection)) {
    return null;
  }

  const analysis = detection.analysis;
  const inspection = analysis?.inspection;
  const project = inspection?.project;

  if (!analysis || !inspection || !project) return null;

  return {
    entity: "DETECTION" as SupplementEntity,
    entityId: detection.id,
    

    
    projectId: inspection.projectId,
    inspectionId: inspection.id,
    organizationId: project.organizationId,

    userId: inspection.conductedByUserId, 
    
    commentId: null,
  };
};

export const fromComment = (comment: AttachmentSubject | null) => {
  if (!comment || !isComment(comment)) {
    return null;
  }

  return {
    entity: "COMMENT" as SupplementEntity,
    entityId: comment.id,
    projectId: comment.inspection?.projectId ?? "",
    userId: comment.userId,
    inspectionId: comment.inspection?.id ?? "",
    organizationId: comment.inspection?.project.organizationId ?? "",
    commentId: comment.id,
  };
};