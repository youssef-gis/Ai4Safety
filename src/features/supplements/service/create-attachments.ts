import { PutObjectCommand } from "@aws-sdk/client-s3";
import { SupplementEntity } from "@prisma/client";
import { s3 } from "@/lib/aws";
import * as attachmentData from "../data";
import * as attachmentSubjectDTO from "../dto/attachment-subject-dto";
import { generateS3Key } from "../utils/generate-s3-key";

type CreateAttachmentsArgs = {
  subject: attachmentSubjectDTO.Type;
  entity: SupplementEntity;
  entityId: string;
  files: (File | string )[];
};

export const createAttachments = async ({
  subject,
  entity,
  entityId,
  files,
}: CreateAttachmentsArgs) => {
  const attachments = [];

  try {
    for (const file of files) {
      if (typeof file === "string") {
        //item is an S3 key or URL
        const attachment = await attachmentData.createAttachment({
          name: file.split("/").pop() ?? "unknown",
          entityId,
          entity,
          url: file
        });
        attachments.push(attachment);
      } 
      else 
        {
      const buffer = await Buffer.from(await file.arrayBuffer());

      const attachment = await attachmentData.createAttachment({
        name: file.name,
        entity,
        entityId,
        url: null
      });

      attachments.push(attachment);

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: generateS3Key({
            organizationId: subject.organizationId,
            projectId: subject.projectId,
            entityId,
            entity,
            fileName: file.name,
            attachmentId: attachment.id,
          }),
          Body: buffer,
          ContentType: file.type,
        })
      );
     }
  }
  } catch (error) {
    throw error;
  }

  return attachments;
};