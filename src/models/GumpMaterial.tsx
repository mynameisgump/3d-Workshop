import * as THREE from "three";
import React, { useRef, useState, JSX, useMemo, useCallback } from "react";
import { useGLTF, Text3D } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";

const brickTexture = new THREE.TextureLoader().load("/brick.jpg");

const standardMaterial = new THREE.MeshStandardMaterial({
  color: "#808080",
  map: brickTexture,
  name: "Standard",
});
const basicMaterial = new THREE.MeshBasicMaterial({
  color: "#808080",
  map: brickTexture,
  name: " Basic",
});
const phongMaterial = new THREE.MeshPhongMaterial({
  color: "#808080",
  map: brickTexture,
  name: " Phong",
});

const MeshToonMaterial = new THREE.MeshToonMaterial({
  color: "#808080",
  map: brickTexture,
  name: " Toon",
});
const GumpMaterial = (props: JSX.IntrinsicElements["group"]) => {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes } = useGLTF("/Gump.glb") as unknown as GLTFResult;
  const [currentMaterial, setCurrentMaterial] =
    useState<THREE.Material>(standardMaterial);

  const changeMaterial = useCallback(() => {
    setCurrentMaterial((prevMaterial) => {
      if (prevMaterial === standardMaterial) {
        return basicMaterial;
      } else if (prevMaterial === basicMaterial) {
        return phongMaterial;
      } else if (prevMaterial === phongMaterial) {
        return MeshToonMaterial;
      } else {
        return standardMaterial;
      }
    });
  }, []);

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group rotation={[0, degToRad(-90), 0]}>
        <mesh
          name="Hat"
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={currentMaterial}
          position={[-0.01, 0.022, 0]}
          rotation={[-Math.PI / 2, -0.163, 1.538]}
          scale={0.006}
          onClick={changeMaterial}
        ></mesh>
        <mesh
          name="Original"
          castShadow
          receiveShadow
          geometry={nodes.Original.geometry}
          material={currentMaterial}
          scale={0.056}
        ></mesh>
      </group>
      <Text3D
        font={"/public/JetBrains Mono_Regular.json"}
        bevelEnabled
        castShadow
        position={[0.13, 0.2, 0]}
        scale={[0.05, 0.05, 0.05]}
        rotation={[0, degToRad(-45), degToRad(-90)]}
      >
        {currentMaterial.name}
      </Text3D>
    </group>
  );
};

useGLTF.preload("/Gump.glb");

export default GumpMaterial;
