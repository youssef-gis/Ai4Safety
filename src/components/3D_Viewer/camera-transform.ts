/**
 * Compute the local-to-ECEF transformation matrix for the reconstruction
 * This should match how WebODM/OpenSfM geo-referenced the model
 */
export const computeLocalToECEFTransform = (
    CesiumJs: any,
    referencePoint: { lon: number; lat: number; alt: number }
): any => {
    // Create an East-North-Up (ENU) frame at the reference point
    const origin = CesiumJs.Cartesian3.fromDegrees(
        referencePoint.lon,
        referencePoint.lat,
        referencePoint.alt
    );
    
    // Get the ENU to ECEF transform at this location
    const enuTransform = CesiumJs.Transforms.eastNorthUpToFixedFrame(origin);
    
    return enuTransform;
};

/**
 * Alternative: If  WebODM output uses UTM coordinates,
 * you need to compute the UTM zone and transform
 */
export const computeUTMToECEFTransform = async (
    CesiumJs: any,
    utmZone: number,
    isNorthernHemisphere: boolean,
    referencePoint: { easting: number; northing: number; altitude: number }
): Promise<any> => {
    // This requires a UTM to WGS84 conversion
    // For now, we'll use the ENU approach which works if the reference is correct
    
    // we might need to use proj4js for accurate UTM conversion
    
    const proj4 = (await import('proj4')).default;
    
    // Define UTM projection
    const utmProj = `+proj=utm +zone=${utmZone} ${isNorthernHemisphere ? '+north' : '+south'} +datum=WGS84`;
    const wgs84 = '+proj=longlat +datum=WGS84';
    
    // Convert reference point to WGS84
    const [lon, lat] = proj4(utmProj, wgs84, [referencePoint.easting, referencePoint.northing]);
    
    return computeLocalToECEFTransform(CesiumJs, { 
        lon, 
        lat, 
        alt: referencePoint.altitude 
    });
};