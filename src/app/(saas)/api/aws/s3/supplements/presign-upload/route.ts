import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { s3 } from "@/lib/aws";
import { nanoid } from "nanoid";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { getActiveOrganization } from "@/features/organization/queries/get-active-organization";
//import { v4 as uuidv4 } from 'uuid';
import { randomUUID } from 'crypto'; 

export async function POST(request: NextRequest) {


  const { filename, contentType, projectId, entity, entityId } = await request.json();

  try {
    const { user } = await getAuthOrRedirect(); 
    const activeOrganization = await getActiveOrganization();
    if (!activeOrganization)return ;

    if (!user || !activeOrganization.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a unique ID for the attachment on the server
    const attachmentId = randomUUID();
    // You can add conditions here for file size, type, etc.
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key:  `organizations/${activeOrganization.id}/projects/${projectId}/${entity}/${entityId}/${attachmentId}-${filename}`, // A better key structure
      Fields: {
        'Content-Type': contentType,
      },
      Conditions: [
        ['content-length-range', 0, 104857600], // up to 10 MB
      ],
      Expires: 600, // 10 minutes
    });

    return NextResponse.json({ url, fields });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}