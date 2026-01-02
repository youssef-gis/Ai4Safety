import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-rerdirect";
import { s3 } from "@/lib/aws";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 
    organizationId: string; 
    projectId: string; 
    inspectionId: string; 
    path: string[] 
  }> }
) {
  // Auth Check
  await getAuthOrRedirect();

  const { organizationId, projectId, inspectionId, path } = await params;

  // Reconstruct the filename from the URL path segments
  let filename = path.join("/");

  // 2. AUTO-DETECT S3 FOLDER
  // We switch the "subFolder" based on what file extension is requested.
  let subFolder = "assets/unzipped_assets/"; // Default fallback

  if (filename.endsWith("shots.geojson")) {
      // Logic: Camera positions usually live in the 'odm_report' folder
      subFolder = "assets/unzipped_assets/odm_report/"; 

  } else if (filename.endsWith(".json") || filename.endsWith(".b3dm") ) {
      // Logic: 3D Tile files live in the 'model' folder
      subFolder = "assets/unzipped_assets/3d_tiles/model/";

  } else if (filename.match(/\.(jpg|jpeg|png|JPG|PNG)$/)) {
      // Logic: Raw images usually live in 'uploaded_images' (or wherever you store raw drone photos)
      subFolder = ""; 
      //  CASE SENSITIVITY FIX:
      // If the request is lowercase 'dji_...jpg' but S3 has 'DJI_...JPG', swap it.
      if (filename.includes("dji_") && filename.endsWith(".jpg")) {
          filename = filename.replace("dji_", "DJI_").replace(".jpg", ".JPG");
      }
  }

  //const relativePath = path.join("/");

  // 2. Construct the S3 Key dynamically
  //const s3Key = `organizations/${organizationId}/projects/${projectId}/INSPECTION/${inspectionId}/assets/unzipped_assets/3d_tiles/model/${relativePath}`;
  //const s3Key = `organizations/${organizationId}/projects/${projectId}/INSPECTION/${inspectionId}/assets/unzipped_assets/${relativePath}`;
  const s3Key = `organizations/${organizationId}/projects/${projectId}/INSPECTION/${inspectionId}/${subFolder}${filename}`;

  //console.log("Generatign Tile Proxy for:", s3Key); 

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.redirect(signedUrl);

  } catch (error) {
    //console.error("Tile error:", error);
    return new NextResponse("Error generating tile URL", { status: 500 });
  }
}