import * as THREE from "three";
import React, { useRef, useState, JSX, useMemo } from "react";
import { useGLTF, Wireframe } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";

const transparentMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5,
  wireframe: true,
});
const GumpWireframe = (props: JSX.IntrinsicElements["group"]) => {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes } = useGLTF("/Gump.glb") as unknown as GLTFResult;

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group rotation={[0, degToRad(-90), 0]}>
        <mesh
          name="Hat"
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          //   material={transparentMaterial}
          position={[-0.01, 0.022, 0]}
          rotation={[-Math.PI / 2, -0.163, 1.538]}
          scale={0.006}
        >
          <Wireframe></Wireframe>
        </mesh>
        <mesh
          name="Original"
          castShadow
          receiveShadow
          geometry={nodes.Original.geometry}
          //   material={transparentMaterial}
          scale={0.056}
        >
          <Wireframe></Wireframe>
        </mesh>
      </group>
    </group>
  );
};

useGLTF.preload("/Gump.glb");

export default GumpWireframe;
