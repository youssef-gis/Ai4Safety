import { Cesium3DTileset, Viewer } from "cesium";
import { RefObject } from "react";

/**
 * Auto-align  tilesets to Cesium.
 * - Fixes Z-up → ENU orientation
 * - Allows height correction
 * - Rotates about model center so geometry stays intact
 *
 * @param tileset Cesium3DTileset
 * @param viewer Cesium Viewer
 * @param Cesium Cesium namespace
 * @param opt options { xRotDeg, heightOffset, debug }
 */
export interface AlignOptions {
  xRotDeg?: number;
  heightOffset?: number;
  debug?: boolean;
}

export function autoAlignTileset(
    tileset: Cesium3DTileset,
    viewer: RefObject<Viewer | null>,
    Cesium: typeof import("cesium"),
    opt:AlignOptions = {}
) {
    const ROT_X_DEG = opt.xRotDeg ?? -90;   // ODM Z-up → ENU
    const HEIGHT_OFFSET = opt.heightOffset ?? 2; // Adjust as needed
    const DEBUG = opt.debug ?? true;

    // STEP 1 — Build full world matrix for the tile root
    const worldFromTile = Cesium.Matrix4.multiply(
        tileset.modelMatrix,
        tileset.root.transform,
        new Cesium.Matrix4()
    );

    // STEP 2 — Find a stable pivot point for rotation
    let pivotWorld;

    if (tileset.boundingSphere) {
        pivotWorld = tileset.boundingSphere.center;
    } else if (tileset.root?.boundingSphere?.center) {
        const localCenter = tileset.root.boundingSphere.center;
        pivotWorld = Cesium.Matrix4.multiplyByPoint(
            worldFromTile,
            localCenter,
            new Cesium.Cartesian3()
        );
    } else {
        pivotWorld = Cesium.Matrix4.getTranslation(
            worldFromTile,
            new Cesium.Cartesian3()
        );
    }

    // STEP 3 — Create local ENU frame at pivot
    const enu = Cesium.Transforms.eastNorthUpToFixedFrame(pivotWorld);
    const enuR = Cesium.Matrix4.getMatrix3(enu, new Cesium.Matrix3());
    const enuR_T = Cesium.Matrix3.transpose(enuR, new Cesium.Matrix3());

    // STEP 4 — Local rotation (ODM Z-up → ENU)
    const localR = Cesium.Matrix3.fromRotationX(
        Cesium.Math.toRadians(ROT_X_DEG)
    );

    // Convert local rotation to world coordinates: Rw = ENU * R_local * ENU^T
    const tmp = new Cesium.Matrix3();
    const R_world3 = Cesium.Matrix3.multiply(
        enuR,
        Cesium.Matrix3.multiply(localR, enuR_T, tmp),
        new Cesium.Matrix3()
    );
    const R_world4 = Cesium.Matrix4.fromRotationTranslation(R_world3);

    // STEP 5 — Translate tile to pivot → rotate → translate back
    const T_toPivot = Cesium.Matrix4.fromTranslation(
        Cesium.Cartesian3.negate(pivotWorld, new Cesium.Cartesian3())
    );
    const T_fromPivot = Cesium.Matrix4.fromTranslation(pivotWorld);

    let rotationFix = Cesium.Matrix4.multiply(
        T_fromPivot,
        R_world4,
        new Cesium.Matrix4()
    );
    rotationFix = Cesium.Matrix4.multiply(
        rotationFix,
        T_toPivot,
        rotationFix
    );

    // STEP 6 — Apply height offset along local ENU "Up"
    const upENU = Cesium.Matrix3.getColumn(
        enuR, 2, new Cesium.Cartesian3()
    );
    const moveWorld = Cesium.Cartesian3.multiplyByScalar(
        upENU,
        HEIGHT_OFFSET,
        new Cesium.Cartesian3()
    );
    const heightFix = Cesium.Matrix4.fromTranslation(moveWorld);

    // STEP 7 — Compose final correction
    const A = Cesium.Matrix4.multiply(
        heightFix,
        rotationFix,
        new Cesium.Matrix4()
    );

    // Apply final correction to modelMatrix
    tileset.root.transform = Cesium.Matrix4.multiply(
        A,
        tileset.root.transform,
        new Cesium.Matrix4()
    );

    if (DEBUG) {
        console.log("WebODM auto-alignment applied:");
        console.log("Rotation X:", ROT_X_DEG);
        console.log("Height offset:", HEIGHT_OFFSET);
        console.log("Pivot world:", pivotWorld);
    }

    return {
        rotationDeg: ROT_X_DEG,
        heightOffset: HEIGHT_OFFSET,
        pivotWorld,
        finalModelMatrix: tileset.modelMatrix
    };
}
