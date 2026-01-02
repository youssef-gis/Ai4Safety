import { SupplementEntity } from "@prisma/client";

type GenerateKeyArgs = {
  organizationId: string;
  projectId: string | undefined ;
  entityId: string;
  entity: SupplementEntity;
  fileName: string;
  attachmentId: string;
  inspectionId?: string;
};

export const generateS3Key = ({
  organizationId,
  projectId,
  entityId,
  entity,
  fileName,
  attachmentId,
  inspectionId
}: GenerateKeyArgs) => {
  // Custom path for Detection to nest it under inspection
  // if (entity === 'DETECTION' && inspectionId) {
  //    return `${organizationId}/${projectId}/inspections/${inspectionId}/defects/${entityId}/${attachmentId}-${fileName}`;
  // }
  //return `${organizationId}/${projectId}/${entity}/${entityId}/${attachmentId}-${fileName}`;
  return   `organizations/${organizationId}/projects/${projectId}/inspections/${inspectionId}/${entity}/${entityId}/${attachmentId}-${fileName}`;
};
//organizations/cmihkw0hy0003w6hon4uobrd8/projects/cmihoymth0001w6eczl0dwbul/inspections/undefined/DETECTION/7a32439e-e850-4862-bf64-bce669350bed/cmjx6zmz20001w6y8657br2ej-9daffc5b-d904-4ebf-946d-8805d55889a0-4d75fb74-694b-4f57-8f79-36158ab26d63-concrete_crack_detection_report.pdf?
