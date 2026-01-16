import { rodriguesToMatrix } from "../get-Ray-From-Pixel";

export const intersectRayWithPlane = (
    CesiumJs: any,
    ray: any,
    planeHeight: number
): any | null => {
    // 1. Calculate the surface normal (Up direction) at the ray origin
    const normal = CesiumJs.Ellipsoid.WGS84.geodeticSurfaceNormal(ray.origin);
    
    // 2. Define a point at the target height
    // We project the camera position to the correct altitude to anchor the plane
    const originCarto = CesiumJs.Cartographic.fromCartesian(ray.origin);
    const pointOnPlane = CesiumJs.Cartesian3.fromRadians(
        originCarto.longitude,
        originCarto.latitude,
        planeHeight
    );
    
    // 3. Create the mathematical plane
    const plane = CesiumJs.Plane.fromPointNormal(pointOnPlane, normal);
    
    // 4. Find intersection
    const intersectionPoint = CesiumJs.IntersectionTests.rayPlane(ray, plane);
    
    // If intersectionPoint is defined, return it directly.
    return intersectionPoint || null;
};

// Put these helpers near your other utils (or above handleCrackProjection)

// Set Cesium camera to the drone camera pose and FOV so depth buffer aligns with the image
export async function setCesiumCameraToDrone(CesiumJs:any, scene:any, cameraData:any, cameraPosECEF:any, localToWorldTransform:any) {
    // Compute forward (camera center - camera frame forward) and up vector
    // Use the same math used to compute dir for pixels but use center pixel (xn=0, yn=0)
    const cx = cameraData.width / 2;
    const cy = cameraData.height / 2;
    const f_pixels = cameraData.focal * Math.max(cameraData.width, cameraData.height);

    // Rotation matrix (world->camera), transpose to get camera->world
    const R_world_to_cam = rodriguesToMatrix(CesiumJs, cameraData.rotation);
    const R_cam_to_world = CesiumJs.Matrix3.transpose(R_world_to_cam, new CesiumJs.Matrix3());

    // camera forward in camera coords (OpenSfM): (0, 0, 1)
    const forwardCam = new CesiumJs.Cartesian3(0, 0, 1);
    const upCam = new CesiumJs.Cartesian3(0, -1, 0); // Y is down in OpenSfM -> up = -Y

    // Rotate to local/world (camera->world)
    const forwardLocal = CesiumJs.Matrix3.multiplyByVector(R_cam_to_world, forwardCam, new CesiumJs.Cartesian3());
    const upLocal = CesiumJs.Matrix3.multiplyByVector(R_cam_to_world, upCam, new CesiumJs.Cartesian3());

    // Apply tileset/world transform (localToWorldTransform) to get ECEF vectors
    const enuRot = CesiumJs.Matrix4.getMatrix3(localToWorldTransform, new CesiumJs.Matrix3());
    const forwardECEF = CesiumJs.Matrix3.multiplyByVector(enuRot, forwardLocal, new CesiumJs.Cartesian3());
    const upECEF = CesiumJs.Matrix3.multiplyByVector(enuRot, upLocal, new CesiumJs.Cartesian3());

    CesiumJs.Cartesian3.normalize(forwardECEF, forwardECEF);
    CesiumJs.Cartesian3.normalize(upECEF, upECEF);

    // Compute vertical FOV from focal (assumes focal in pixels when multiplied)
    const verticalFov = 2 * Math.atan(cameraData.height / (2 * f_pixels));

    // Apply to Cesium camera
    try {
        // Use a fresh PerspectiveFrustum with matching fov + aspect
        const canvas = scene.canvas;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        scene.camera.frustum = new CesiumJs.PerspectiveFrustum({ fovy: verticalFov, aspectRatio: aspect });

        // Set view with direction/up (direction vector points FROM camera towards scene in Cesium terminology)
        scene.camera.setView({
            destination: cameraPosECEF,
            orientation: {
                direction: forwardECEF,
                up: upECEF
            }
        });

        // Ensure render & depth buffer warmed
        scene.requestRender();
    } catch (e) {
        console.warn("Failed to set Cesium camera to drone pose:", e);
    }
}

// Convert a point on the ray -> window coordinates (Cartesian2) if possible
export function getScreenPosFromRayPoint(CesiumJs:any, scene:any, ray:any, distance:any) {
    const testPoint = CesiumJs.Ray.getPoint(ray, distance);
    const screenPos = CesiumJs.SceneTransforms.worldToWindowCoordinates(scene, testPoint); // <-- fix below
    return screenPos ? new CesiumJs.Cartesian2(screenPos.x, screenPos.y) : null;
}


