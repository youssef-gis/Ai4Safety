export const getOrientationFromRodrigues = (CesiumJs: any, rotVec: number[]): any => {
    const [rx, ry, rz] = rotVec;
    const theta = Math.sqrt(rx * rx + ry * ry + rz * rz);
    
    if (theta < 1e-10) {
        return CesiumJs.Matrix3.IDENTITY.clone();
    }
    
    // Normalized axis
    const kx = rx / theta;
    const ky = ry / theta;
    const kz = rz / theta;
    
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const v = 1 - c;
    
    // Rodrigues formula: R = I + sin(θ)K + (1-cos(θ))K²
    // where K is the skew-symmetric matrix of the axis
    const m=  new CesiumJs.Matrix3(
        c + kx * kx * v,      kx * ky * v - kz * s, kx * kz * v + ky * s,
        ky * kx * v + kz * s, c + ky * ky * v,      ky * kz * v - kx * s,
        kz * kx * v - ky * s, kz * ky * v + kx * s, c + kz * kz * v
    );

    return CesiumJs.Quaternion.fromRotationMatrix(m);
};