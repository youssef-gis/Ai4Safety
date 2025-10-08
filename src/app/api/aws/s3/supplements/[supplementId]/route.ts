import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import * as attachmentData from "@/features/supplements/data";
import * as attachmentSubjectDTO from "@/features/supplements/dto/attachment-subject-dto";
import { generateS3Key } from "@/features/supplements/utils/generate-s3-key";
import { s3 } from "@/lib/aws";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplementId: string }> }
) {
  await getAuthOrRedirect();

  const { supplementId } = await params;

  const attachment = await attachmentData.getAttachment(supplementId);

  let subject;
  switch (attachment?.entity) {
    case "INSPECTION":
      subject = attachmentSubjectDTO.fromInspection(attachment.inspection);
      break;
    case "ANALYSIS":
      subject = attachmentSubjectDTO.fromAnalysis(attachment.analysis);
      break;
    case "COMMENT":
      subject = attachmentSubjectDTO.fromComment(attachment.comment);
      break;
  }

  if (!subject || !attachment) {
    throw new Error("Subject not found");
  }

  if (!subject.organizationId) {
  throw new Error("Organization ID is required to generate presigned URL");
}

  const presignedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: generateS3Key({
        organizationId: subject.organizationId , // ?? 'default-org', // Fallback value,
        projectId: attachment.inspection?.projectId,
        entityId: subject.entityId,
        entity: attachment.entity,
        fileName: attachment.name,
        attachmentId: attachment.id,
      }),
    }),
    { expiresIn: 5 * 60 }
  );

  const response = await fetch(presignedUrl);

  const headers = new Headers();
  headers.append(
    "content-disposition",
    `attachment; filename="${attachment.name}"`
  );

  return   new Response(response.body, {
    headers,
  })
}