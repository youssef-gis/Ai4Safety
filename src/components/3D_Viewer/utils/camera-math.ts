// utils/camera-math.ts (or put at top of cesium.tsx)
import { Cartesian3, Math as CesiumMath, Entity, Cartesian2, Scene, defined, Quaternion, Matrix4, Matrix3 } from 'cesium';
import { CesiumType } from '../types/cesium';

interface CameraScore {
  entity: Entity;
  score: number;
}

/**
 * Calculates the surface normal at a picked location by sampling neighboring pixels.
 */
export const getSurfaceNormal = (scene: Scene, windowPosition: Cartesian2): Cartesian3 | null => {
    // 1. Pick the center point
    const center = scene.pickPosition(windowPosition);
    if (!defined(center)) return null;

    // 2. Pick two neighbors (1 pixel right, 1 pixel up)
    const right = scene.pickPosition(new Cartesian2(windowPosition.x + 1, windowPosition.y));
    const up = scene.pickPosition(new Cartesian2(windowPosition.x, windowPosition.y + 1));

    if (!defined(right) || !defined(up)) return null;

    // 3. Create vectors
    const v1 = Cartesian3.subtract(right, center, new Cartesian3());
    const v2 = Cartesian3.subtract(up, center, new Cartesian3());

    // 4. Cross Product = Normal Vector
    // Note: The order (v1 x v2) vs (v2 x v1) depends on coordinate system, 
    // usually Cesium creates an outward normal with this order.
    const normal = Cartesian3.cross(v1, v2, new Cartesian3());
    
    return Cartesian3.normalize(normal, new Cartesian3());
};

/**
 * Ranks all drone cameras to find which one has the best view of the target point.
 */
export const findBestCamera = (
  CesiumJs: any,
  targetPoint: Cartesian3,
  surfaceNormal: Cartesian3 | null, // <--- New Parameter
  cameraEntities: Entity[]
): Entity | null => {
  let bestCamera: Entity | null = null;
  let bestScore = -Infinity;

  cameraEntities.forEach((camera) => {
    const camPos = camera.position?.getValue(CesiumJs.JulianDate.now());
    if (!camPos) return;

    // 1. Distance Vector (Target -> Camera)
    // Note: We want the vector pointing FROM target TO camera to compare with normal
    const targetToCamera = CesiumJs.Cartesian3.subtract(camPos, targetPoint, new CesiumJs.Cartesian3());
    const distance = CesiumJs.Cartesian3.magnitude(targetToCamera);
    const targetToCameraNorm = CesiumJs.Cartesian3.normalize(targetToCamera, new CesiumJs.Cartesian3());

    if (distance > 100) return;

    // 2. Alignment (Is point in center of image?)
    // Camera View Vector (Camera -> Target)
    const cameraLookDir = CesiumJs.Cartesian3.negate(targetToCameraNorm, new CesiumJs.Cartesian3()); 
    
    // Get actual Camera Orientation
    const orientation = camera.orientation?.getValue(CesiumJs.JulianDate.now());
    const transform = CesiumJs.Matrix3.fromQuaternion(orientation);
    const cameraForward = CesiumJs.Matrix3.multiplyByVector(transform, CesiumJs.Cartesian3.UNIT_Z, new CesiumJs.Cartesian3());

    const viewAlignment = CesiumJs.Cartesian3.dot(cameraForward, cameraLookDir);
    if (viewAlignment < 0.5) return; // Must be somewhat in front of camera

    // 3. Incidence Angle (Are we facing the wall?)
    let incidenceScore = 0;
    if (surfaceNormal) {
        // Dot product of (Surface Normal) and (Vector To Camera)
        // 1.0 = Camera is directly perpendicular to surface (Best)
        // 0.0 = Camera is looking down the edge of the wall (Bad)
        const dot = CesiumJs.Cartesian3.dot(surfaceNormal, targetToCameraNorm);
        incidenceScore = Math.max(0, dot); 
    }


    const score = (viewAlignment * 100) - (distance * 0.5) + (incidenceScore * 200);

    if (score > bestScore) {
      bestScore = score;
      bestCamera = camera;
    }
  });

  return bestCamera;
};


// --- MATH HELPER: Project 3D World Point to 2D Image Pixel ---
export function projectWorldToImage(
    worldPosition: { x: number, y: number, z: number },
    cameraPose: { position: Cartesian3, orientation: Quaternion },
    intrinsics: { width: number, height: number, focal: number }
) {
    // 1. Convert World Point to Cesium Cartesian3
    const pointWS = new Cartesian3(worldPosition.x, worldPosition.y, worldPosition.z);

    // 2. Create View Matrix (World -> Camera) from Position & Orientation
    const viewMatrix = Matrix4.fromRotationTranslation(
        Matrix3.fromQuaternion(cameraPose.orientation),
        cameraPose.position
    );
    const inverseView = Matrix4.inverse(viewMatrix, new Matrix4());

    // 3. Transform Point to Camera Local Space
    // In Cesium (and standard GL), Camera looks down -Z. Right is +X, Up is +Y.
    const pointCamera = Matrix4.multiplyByPoint(inverseView, pointWS, new Cartesian3());

    // 4. Check Visibility (Is point behind camera?)
    // Note: Depending on your coordinate system convention (Y-up vs Z-up), 
    // "Forward" might be -Z or +Z. Standard Photogrammetry often uses -Z forward.
    if (pointCamera.z > 0) return null; // Behind the camera (assuming -Z view)

    // 5. Project to Image Plane (Pinhole Model)
    // x_screen = (focal * x_local) / -z_local
    // Note: We need focal length in PIXELS. If your focal is in mm, you need sensor width.
   
    
    // If focal is 0 or missing, approximate using a standard FOV (e.g. 60 deg)
    const effectiveFocal = intrinsics.focal || (intrinsics.width * 0.8); 

    const u = (pointCamera.x / -pointCamera.z) * effectiveFocal;
    const v = (pointCamera.y / -pointCamera.z) * effectiveFocal;

    // 6. Map to Pixel Coordinates (Center is 0,0 -> TopLeft is 0,0)
    // Adjust signs based on coordinate system (Y is usually inverted in images)
    const xPixel = (intrinsics.width / 2) + u;
    const yPixel = (intrinsics.height / 2) - v; 

    // 7. Bounds Check
    if (xPixel < 0 || xPixel > intrinsics.width || yPixel < 0 || yPixel > intrinsics.height) {
        return null;
    }

    return { x: xPixel, y: yPixel };
}