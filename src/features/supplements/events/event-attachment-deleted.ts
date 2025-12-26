import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { SupplementEntity } from "@prisma/client";
import { s3 } from "@/lib/aws";
import { inngest } from "@/lib/inngest";
import { generateS3Key } from "../utils/generate-s3-key";

export type SupplementDeleteEventArgs = {
  data: {
    attachmentId: string;
    organizationId: string;
    entityId: string;
    entity: SupplementEntity;
    fileName: string;
    projectId: string;
  };
};

export const supplementDeletedEvent = inngest.createFunction(
  { id: "supplement-deleted" },
  { event: "app/supplement.deleted" },
  async ({ event }) => {
    const { organizationId, entityId, entity, fileName, attachmentId, projectId } =
      event.data;

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: generateS3Key({
            organizationId,
            entityId,
            entity,
            fileName,
            attachmentId,
            projectId
          }),
        })
      );
    } catch (error) {
      console.log(error);
      return { event, body: false };
    }

    return { event, body: true };
  }
);