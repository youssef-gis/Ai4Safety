import { SupplementEntity } from "@prisma/client";

type GenerateKeyArgs = {
  organizationId: string;
  projectId: string | undefined ;
  entityId: string;
  entity: SupplementEntity;
  fileName: string;
  attachmentId: string;
};

export const generateS3Key = ({
  organizationId,
  projectId,
  entityId,
  entity,
  fileName,
  attachmentId,
}: GenerateKeyArgs) => {
  return `${organizationId}/${projectId}/${entity}/${entityId}/${attachmentId}-${fileName}`;
};