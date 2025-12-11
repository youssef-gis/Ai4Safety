import {
    Cartesian3,
    Matrix3,
    Matrix4,
    Ray,
} from 'cesium';

interface CameraProperties {
    focal: number;
    width: number;
    height: number;
    k1?: number;
    k2?: number;
    translation: [number, number, number];
    rotation: [number, number, number];
    gpsPosition: { lon: number, lat: number, alt: number };
}

interface PixelPoint {
    x: number;
    y: number;
}

export const rodriguesToMatrix = (CesiumJs: any, rotVec: number[]): Matrix3 => {
    const [rx, ry, rz] = rotVec;
    const theta = Math.sqrt(rx * rx + ry * ry + rz * rz);
    
    if (theta < 1e-10) {
        return CesiumJs.Matrix3.IDENTITY.clone();
    }

    const kx = rx / theta;
    const ky = ry / theta;
    const kz = rz / theta;
    
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const v = 1 - c;

    return new CesiumJs.Matrix3(
        c + kx * kx * v,       kx * ky * v - kz * s,  kx * kz * v + ky * s,
        ky * kx * v + kz * s,  c + ky * ky * v,       ky * kz * v - kx * s,
        kz * kx * v - ky * s,  kz * ky * v + kx * s,  c + kz * kz * v
    );
};

export const getCameraPositionECEF = (
    CesiumJs: any,
    translation: [number, number, number],
    localToWorldTransform: Matrix4
): Cartesian3 => {
    const localPos = new CesiumJs.Cartesian3(translation[0], translation[1], translation[2]);
    return CesiumJs.Matrix4.multiplyByPoint(localToWorldTransform, localPos, new CesiumJs.Cartesian3());
};


/**
 * Convert 2D pixel to 3D ray in ECEF coordinates
 * Uses [-X, -Y, -Z] sign combination based on testing
 */
export const getRayFromPixel = (
    CesiumJs: any,
    pixel: PixelPoint,
    cameraProps: CameraProperties,
    cameraPositionECEF: Cartesian3,
    localToECEFTransform: Matrix4
): Ray | null => {
    const { width, height, focal, k1 = 0, rotation } = cameraProps;

    // 1. Normalized camera coordinates
    const cx = width / 2;
    const cy = height / 2;
    const f = focal * Math.max(width, height);
    
    let xn = (pixel.x - cx) / f;
    let yn = (pixel.y - cy) / f;

    // 2. Undistort
    if (Math.abs(k1) > 1e-6) {
        for (let i = 0; i < 10; i++) {
            const r2 = xn * xn + yn * yn;
            const d = 1 + k1 * r2;
            xn = ((pixel.x - cx) / f) / d;
            yn = ((pixel.y - cy) / f) / d;
        }
    }

    // 3. Camera direction (OpenSfM: X-right, Y-down, Z-forward)
    const dirCam = new CesiumJs.Cartesian3(xn, yn, 1);
    CesiumJs.Cartesian3.normalize(dirCam, dirCam);

    // 4. Rotate to world frame
    const R = rodriguesToMatrix(CesiumJs, rotation);
    const Rt = CesiumJs.Matrix3.transpose(R, new CesiumJs.Matrix3());
    const dirLocal = CesiumJs.Matrix3.multiplyByVector(Rt, dirCam, new CesiumJs.Cartesian3());

    // 5. Apply sign correction: [-X, -Y, -Z] (found through testing)
    const dirENU = new CesiumJs.Cartesian3(
        -dirLocal.x,
        -dirLocal.y,
        -dirLocal.z
    );

    // 6. Transform to ECEF
    const enuRot = CesiumJs.Matrix4.getMatrix3(localToECEFTransform, new CesiumJs.Matrix3());
    const dirECEF = CesiumJs.Matrix3.multiplyByVector(enuRot, dirENU, new CesiumJs.Cartesian3());
    CesiumJs.Cartesian3.normalize(dirECEF, dirECEF);

    if (!isFinite(dirECEF.x)) return null;

    return new CesiumJs.Ray(cameraPositionECEF, dirECEF);
};


// get-camera-position.ts
export const getCameraPositionFromReconstruction = (
    CesiumJs: any,
    translation: [number, number, number],
    rotation: [number, number, number],
    localToWorldTransform: any
): any => {
    // OpenSfM convention: 
    // rotation: world-to-camera rotation (Rodrigues)
    // translation: t where P_camera = R * P_world + t
    // So camera center C = -R^T * t
    
    const R = rodriguesToMatrix(CesiumJs, rotation);
    const Rt = CesiumJs.Matrix3.transpose(R, new CesiumJs.Matrix3());
    
    // Camera center in local coordinates
    const t = new CesiumJs.Cartesian3(translation[0], translation[1], translation[2]);
    const negT = CesiumJs.Cartesian3.negate(t, new CesiumJs.Cartesian3());
    const camPosLocal = CesiumJs.Matrix3.multiplyByVector(Rt, negT, new CesiumJs.Cartesian3());
    
    // Transform to ECEF using the same transform as the tileset
    return CesiumJs.Matrix4.multiplyByPoint(
        localToWorldTransform,
        camPosLocal,
        new CesiumJs.Cartesian3()
    );
};

// get-ray-from-pixel-fixed.ts
export const getRayFromPixelFixed = (
    CesiumJs: any,
    pixel: { x: number; y: number },
    cameraProps: {
        width: number;
        height: number;
        focal: number;
        k1?: number;
        k2?: number;
        rotation: [number, number, number];
        translation: [number, number, number];
    },
    localToWorldTransform: any
): { origin: any; direction: any } | null => {
    
    const { width, height, focal, k1 = 0, k2 = 0, rotation, translation } = cameraProps;
    
    // 1. Pixel to normalized camera coordinates
    const cx = width / 2;
    const cy = height / 2;
    const f = focal * Math.max(width, height);
    
    let xn = (pixel.x - cx) / f;
    let yn = (pixel.y - cy) / f;
    
    // 2. Undistort (Brown model - iterative)
    if (Math.abs(k1) > 1e-8 || Math.abs(k2) > 1e-8) {
        const xd = xn, yd = yn;
        for (let i = 0; i < 20; i++) {
            const r2 = xn * xn + yn * yn;
            const r4 = r2 * r2;
            const radialDistortion = 1 + k1 * r2 + k2 * r4;
            xn = xd / radialDistortion;
            yn = yd / radialDistortion;
        }
    }
    
    // 3. Direction in camera frame (OpenSfM: X-right, Y-down, Z-forward)
    const dirCam = new CesiumJs.Cartesian3(xn, yn, 1.0);
    CesiumJs.Cartesian3.normalize(dirCam, dirCam);
    
    // 4. Rotation from world to camera (Rodrigues)
    const R_world_to_cam = rodriguesToMatrix(CesiumJs, rotation);
    
    // 5. Transpose to get camera-to-world rotation
    const R_cam_to_world = CesiumJs.Matrix3.transpose(
        R_world_to_cam, 
        new CesiumJs.Matrix3()
    );
    
    // 6. Transform direction to local world frame
    const dirLocal = CesiumJs.Matrix3.multiplyByVector(
        R_cam_to_world, 
        dirCam, 
        new CesiumJs.Cartesian3()
    );
    
    // 7. OpenSfM uses: X=East, Y=North, Z=Up (ENU)
    // But tileset might be rotated, so apply tileset's ENU frame
    const enuRotation = CesiumJs.Matrix4.getMatrix3(
        localToWorldTransform, 
        new CesiumJs.Matrix3()
    );
    
    const dirECEF = CesiumJs.Matrix3.multiplyByVector(
        enuRotation, 
        dirLocal, 
        new CesiumJs.Cartesian3()
    );
    CesiumJs.Cartesian3.normalize(dirECEF, dirECEF);
    
    // 8. Camera position in ECEF
    // OpenSfM: camera position C = -R^T * t
    const t = new CesiumJs.Cartesian3(translation[0], translation[1], translation[2]);
    const negT = CesiumJs.Cartesian3.negate(t, new CesiumJs.Cartesian3());
    const camPosLocal = CesiumJs.Matrix3.multiplyByVector(
        R_cam_to_world, 
        negT, 
        new CesiumJs.Cartesian3()
    );
    
    const camPosECEF = CesiumJs.Matrix4.multiplyByPoint(
        localToWorldTransform,
        camPosLocal,
        new CesiumJs.Cartesian3()
    );
    
    if (!isFinite(dirECEF.x) || !isFinite(camPosECEF.x)) {
        return null;
    }
    
    return {
        origin: camPosECEF,
        direction: dirECEF
    };
};

// intersection-utils.ts
export const intersectRayWithTileset = async (
    CesiumJs: any,
    scene: any,
    ray: any,
    tileset: any,
    maxDistance: number
): Promise<{ position: any; hitType: string } | null> => {
    
    scene.render();

    // METHOD 1: pickFromRay with all objects
    try {
        const result = scene.pickFromRay(ray, [], 0.0001);
        if (result?.position) {
            // Verify it's not at the ray origin
            const dist = CesiumJs.Cartesian3.distance(ray.origin, result.position);
            if (dist > 1) { // At least 1 meter away
                const obj = result.object;
                let hitType = 'pickFromRay-unknown';
                if (obj?.primitive === tileset || obj?.tileset === tileset || 
                    obj?.content?.tileset === tileset) {
                    hitType = 'pickFromRay-tileset';
                } else if (obj?.primitive instanceof CesiumJs.Globe) {
                    hitType = 'pickFromRay-globe';
                } else {
                    hitType = 'pickFromRay-other';
                }
                return { position: result.position, hitType };
            }
        }
    } catch (e) { 
        console.debug("pickFromRay error:", e);
    }

    // METHOD 2: drillPickFromRay
    try {
        const results = scene.drillPickFromRay(ray, 20, [], 0.0001);
        if (results?.length > 0) {
            for (const r of results) {
                if (!r.position) continue;
                const dist = CesiumJs.Cartesian3.distance(ray.origin, r.position);
                if (dist > 1) {
                    const obj = r.object;
                    if (obj?.primitive === tileset || obj?.tileset === tileset ||
                        obj?.content?.tileset === tileset) {
                        return { position: r.position, hitType: 'drillPick-tileset' };
                    }
                }
            }
            // Return first valid hit
            for (const r of results) {
                if (!r.position) continue;
                const dist = CesiumJs.Cartesian3.distance(ray.origin, r.position);
                if (dist > 1) {
                    return { position: r.position, hitType: 'drillPick-other' };
                }
            }
        }
    } catch (e) { /* Continue */ }

    // METHOD 3: Bounding sphere - FIXED for camera inside sphere
    if (tileset?.boundingSphere) {
        const sphere = tileset.boundingSphere;
        const intersection = CesiumJs.IntersectionTests.raySphere(ray, sphere);
        
        if (intersection) {
            // Check if camera is inside the bounding sphere
            const distToCenter = CesiumJs.Cartesian3.distance(ray.origin, sphere.center);
            const isInside = distToCenter < sphere.radius;
            
            // Use exit point if inside, entry point if outside
            let t = isInside ? intersection.stop : intersection.start;
            
            // Make sure t is positive and reasonable
            if (t <= 0) t = intersection.stop;
            if (t <= 0 || t > maxDistance) {
                // Fallback: project to sphere center distance
                t = distToCenter;
            }
            
            const point = CesiumJs.Ray.getPoint(ray, t);
            const dist = CesiumJs.Cartesian3.distance(ray.origin, point);
            
            console.log(`BoundingSphere: inside=${isInside}, t=${t.toFixed(2)}, dist=${dist.toFixed(2)}`);
            
            if (dist > 1) {
                return { position: point, hitType: 'boundingSphere' };
            }
        }
    }

    // METHOD 4: Simple distance-based fallback
    // Project ray to the distance of tileset center
    if (tileset?.boundingSphere) {
        const distToCenter = CesiumJs.Cartesian3.distance(ray.origin, tileset.boundingSphere.center);
        const point = CesiumJs.Ray.getPoint(ray, distToCenter);
        return { position: point, hitType: 'distance-fallback' };
    }

    return null;
};

// Add this function to project a point DOWN onto the tileset surface
export const snapPointToTileset = async (
    CesiumJs: any,
    scene: any,
    point: any,
    tileset: any,
    maxHeight: number = 100
): Promise<{ position: any; success: boolean }> => {
    // Create a vertical ray from above the point, pointing down
    const cartographic = CesiumJs.Cartographic.fromCartesian(point);
    const abovePoint = CesiumJs.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height + maxHeight
    );
    
    const down = CesiumJs.Cartesian3.normalize(
        CesiumJs.Cartesian3.negate(
            CesiumJs.Cartesian3.normalize(abovePoint, new CesiumJs.Cartesian3()),
            new CesiumJs.Cartesian3()
        ),
        new CesiumJs.Cartesian3()
    );
    
    // Actually, use ENU "down" direction
    const enu = CesiumJs.Transforms.eastNorthUpToFixedFrame(point);
    const enuRot = CesiumJs.Matrix4.getMatrix3(enu, new CesiumJs.Matrix3());
    const downENU = new CesiumJs.Cartesian3(0, 0, -1); // Down in ENU
    const downECEF = CesiumJs.Matrix3.multiplyByVector(enuRot, downENU, new CesiumJs.Cartesian3());
    
    // Shoot ray down from above the point
    const rayOrigin = CesiumJs.Cartesian3.add(
        point,
        CesiumJs.Cartesian3.multiplyByScalar(
            CesiumJs.Cartesian3.negate(downECEF, new CesiumJs.Cartesian3()),
            maxHeight,
            new CesiumJs.Cartesian3()
        ),
        new CesiumJs.Cartesian3()
    );
    
    const ray = new CesiumJs.Ray(rayOrigin, downECEF);
    
    try {
        const result = scene.pickFromRay(ray);
        if (result?.position) {
            return { position: result.position, success: true };
        }
    } catch (e) { /* Continue */ }
    
    try {
        const results = scene.drillPickFromRay(ray, 10);
        if (results?.length > 0) {
            for (const r of results) {
                if (r.position) {
                    return { position: r.position, success: true };
                }
            }
        }
    } catch (e) { /* Continue */ }
    
    return { position: point, success: false };
};