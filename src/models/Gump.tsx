import * as THREE from "three";
import React, { useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import { degToRad, lerp } from "three/src/math/MathUtils.js";
import { easing } from "maath";
import { Matrix4, Object3D, Quaternion, Vector3 } from "three";
import frag from "../Shaders/psx.frag";
import vert from "../Shaders/psx.vert";

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh;
    Original: THREE.Mesh;
  };
  materials: {
    Material__67: THREE.MeshPhysicalMaterial;
    Head: THREE.MeshStandardMaterial;
  };
};

const Gump = (props: JSX.IntrinsicElements["group"]) => {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF("/Gump.glb") as GLTFResult;

  const [dummy] = useState(() => new THREE.Object3D());
  useFrame((state, dt) => {
    dummy.lookAt(state.pointer.x, state.pointer.y, 2);
    easing.dampQ(groupRef.current.quaternion, dummy.quaternion, 0.15, dt);
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group rotation={[0, degToRad(-90), 0]}>
        <mesh
          name="Hat"
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.Material__67}
          position={[-0.01, 0.022, 0]}
          rotation={[-Math.PI / 2, -0.163, 1.538]}
          scale={0.006}
        />
        <mesh
          name="Original"
          castShadow
          receiveShadow
          geometry={nodes.Original.geometry}
          material={materials.Head}
          scale={0.056}
        />
      </group>
    </group>
  );
};

useGLTF.preload("/Gump.glb");

export default Gump;
