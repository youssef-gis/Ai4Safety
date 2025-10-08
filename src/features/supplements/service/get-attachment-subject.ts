import { SupplementEntity } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import * as attachmentSubjectDTO from "../dto/attachment-subject-dto";

export const getAttachmentSubject = async (
  entityId: string,
  entity: SupplementEntity
) => {
  switch (entity) {
    case "INSPECTION": {
      const inspection = await prisma.inspection.findUnique({
        where: {
          id: entityId,
        },
        include:{
          project:{
            select:{
              organizationId:true
            }
          }
        }
      });

      if(!inspection) return null;

      return attachmentSubjectDTO.fromInspection(inspection);
    }
  
    case "ANALYSIS": {
      const analysis = await prisma.analysis.findUnique({
        where: {
          id: entityId,
        },
        include: {
          inspection:{
            include:{
              project:{
                select:{
                  organizationId:true
                }
              }
            }
          }
        }
      });

      if(!analysis) return null;

      return attachmentSubjectDTO.fromAnalysis(analysis);
    }
  
    case "COMMENT": {
      const comment = await prisma.comment.findUnique({
        where: {
          id: entityId,
        },
        include: {
          inspection: {
            include:{
              project:{
                select:{
                  organizationId:true,
                }
              }
            }
          },
        },
      });

      if(!comment) return null;

      return attachmentSubjectDTO.fromComment(comment);
    }
    default:
      return null;
  }
};