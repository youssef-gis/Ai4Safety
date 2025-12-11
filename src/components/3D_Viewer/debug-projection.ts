import { Cartesian3 } from 'cesium';
import { getRayFromPixel, rodriguesToMatrix } from './get-Ray-From-Pixel';

export const debugCameraProjection = (
    CesiumJs: any,
    viewer: any,
    cameraData: any,
    localToWorld: any,
    dataSource: any
) => {
    if (!viewer || !cameraData || !dataSource) {
        console.error("Missing required parameters for debug");
        return;
    }

    console.log("=== DEBUG CAMERA PROJECTION ===");
    console.log("Camera Data:", JSON.stringify(cameraData, null, 2));

    // Get camera position from GPS
    const cameraPosECEF = CesiumJs.Cartesian3.fromDegrees(
        cameraData.gpsPosition.lon,
        cameraData.gpsPosition.lat,
        cameraData.gpsPosition.alt
    );

    // Create fresh ENU transform at camera position
    const enuTransform = CesiumJs.Transforms.eastNorthUpToFixedFrame(cameraPosECEF);

    console.log("Camera Position ECEF:", {
        x: cameraPosECEF.x,
        y: cameraPosECEF.y,
        z: cameraPosECEF.z
    });

    // Clear previous debug entities
    const entitiesToRemove: any[] = [];
    dataSource.entities.values.forEach((entity: any) => {
        if (entity.id && entity.id.startsWith('debug_')) {
            entitiesToRemove.push(entity);
        }
    });
    entitiesToRemove.forEach((e: any) => dataSource.entities.remove(e));

    // Draw camera position
    dataSource.entities.add({
        id: `debug_cam_pos_${Date.now()}`,
        position: cameraPosECEF,
        point: {
            pixelSize: 20,
            color: CesiumJs.Color.MAGENTA,
            outlineColor: CesiumJs.Color.WHITE,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
            text: 'Camera',
            font: '14px sans-serif',
            fillColor: CesiumJs.Color.WHITE,
            showBackground: true,
            backgroundColor: CesiumJs.Color.MAGENTA.withAlpha(0.8),
            pixelOffset: new CesiumJs.Cartesian2(0, -30),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });

    // Draw frustum corners
    const testPoints = [
        { x: cameraData.width / 2, y: cameraData.height / 2, name: 'CENTER', color: CesiumJs.Color.WHITE },
        { x: 0, y: 0, name: 'TL', color: CesiumJs.Color.RED },
        { x: cameraData.width, y: 0, name: 'TR', color: CesiumJs.Color.GREEN },
        { x: cameraData.width, y: cameraData.height, name: 'BR', color: CesiumJs.Color.BLUE },
        { x: 0, y: cameraData.height, name: 'BL', color: CesiumJs.Color.YELLOW },
    ];

    const rayLength = 100; // meters

    testPoints.forEach((testPoint, idx) => {
        const ray = getRayFromPixel(
            CesiumJs,
            { x: testPoint.x, y: testPoint.y },
            cameraData,
            cameraPosECEF,
            enuTransform
        );

        if (ray) {
            const endPoint = CesiumJs.Cartesian3.add(
                ray.origin,
                CesiumJs.Cartesian3.multiplyByScalar(
                    ray.direction, 
                    rayLength, 
                    new CesiumJs.Cartesian3()
                ),
                new CesiumJs.Cartesian3()
            );

            // Draw ray line
            dataSource.entities.add({
                id: `debug_ray_${testPoint.name}_${Date.now()}`,
                polyline: {
                    positions: [ray.origin, endPoint],
                    width: 3,
                    material: testPoint.color,
                    arcType: CesiumJs.ArcType.NONE
                }
            });

            // Draw endpoint
            dataSource.entities.add({
                id: `debug_rayend_${testPoint.name}_${Date.now()}`,
                position: endPoint,
                point: {
                    pixelSize: 10,
                    color: testPoint.color,
                    outlineColor: CesiumJs.Color.BLACK,
                    outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                label: {
                    text: testPoint.name,
                    font: '12px sans-serif',
                    fillColor: CesiumJs.Color.WHITE,
                    showBackground: true,
                    backgroundColor: testPoint.color.withAlpha(0.8),
                    pixelOffset: new CesiumJs.Cartesian2(0, -20),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });

            // Try to pick the scene
            const scene = viewer.scene;
            const pickResult = scene.pickFromRay(ray);
            
            if (pickResult && pickResult.position) {
                dataSource.entities.add({
                    id: `debug_hit_${testPoint.name}_${Date.now()}`,
                    position: pickResult.position,
                    point: {
                        pixelSize: 15,
                        color: CesiumJs.Color.LIME,
                        outlineColor: CesiumJs.Color.BLACK,
                        outlineWidth: 3,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                });
                console.log(`✅ ${testPoint.name} HIT:`, pickResult.position);
            } else {
                console.log(`❌ ${testPoint.name} MISS`);
            }
        } else {
            console.error(`❌ Failed to create ray for ${testPoint.name}`);
        }
    });

    // Draw coordinate axes at camera position
    const axisLength = 20;
    const axes = [
        { dir: new CesiumJs.Cartesian3(1, 0, 0), color: CesiumJs.Color.RED, name: 'X (East)' },
        { dir: new CesiumJs.Cartesian3(0, 1, 0), color: CesiumJs.Color.GREEN, name: 'Y (North)' },
        { dir: new CesiumJs.Cartesian3(0, 0, 1), color: CesiumJs.Color.BLUE, name: 'Z (Up)' },
    ];

    const enuRotation = CesiumJs.Matrix4.getMatrix3(enuTransform, new CesiumJs.Matrix3());

    axes.forEach(axis => {
        const dirWorld = CesiumJs.Matrix3.multiplyByVector(
            enuRotation,
            axis.dir,
            new CesiumJs.Cartesian3()
        );
        CesiumJs.Cartesian3.normalize(dirWorld, dirWorld);

        const endPoint = CesiumJs.Cartesian3.add(
            cameraPosECEF,
            CesiumJs.Cartesian3.multiplyByScalar(dirWorld, axisLength, new CesiumJs.Cartesian3()),
            new CesiumJs.Cartesian3()
        );

        dataSource.entities.add({
            id: `debug_axis_${axis.name}_${Date.now()}`,
            polyline: {
                positions: [cameraPosECEF, endPoint],
                width: 5,
                material: axis.color
            }
        });
    });

    console.log("=== DEBUG COMPLETE ===");
    viewer.scene.requestRender();
};