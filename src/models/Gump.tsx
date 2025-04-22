import * as THREE from "three";
import React, { useRef, useState, JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLTF } from "three-stdlib";
import { degToRad, lerp } from "three/src/math/MathUtils.js";
import { easing } from "maath";
import { Texture, Color, Quaternion, Vector3, TextureLoader } from "three";
import frag from "../Shaders/psx.frag?raw";
import vert from "../Shaders/psx.vert?raw";
import { color } from "three/tsl";

interface Client {
  name: string;
  age: number;
}

const test = { name: "Ethan", age: 25 } as Client;

const shaderUniforms = {
  time: 0,
  color: new Color(0.2, 0.0, 0.1),
  resolution: [1024, 1024],
  jitter: 0.8,
  albedo: new Texture(),
};

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
  const { nodes, materials } = useGLTF("/Gump.glb") as unknown as GLTFResult;

  const faceUniforms = useMemo(
    () => ({
      time: {
        value: 0.0,
      },
      color: {
        value: new Color(0.2, 0.0, 0.1),
      },
      resolution: {
        value: new Vector3(1024, 1024, 0),
      },
      jitter: {
        value: 0.8,
      },
      albedo: {
        value: materials.Head.map,
      },
    }),
    []
  );
  const hatUniforms = useMemo(
    () => ({
      time: {
        value: 0.0,
      },
      color: {
        value: new Color(0.2, 0.0, 0.1),
      },
      resolution: {
        value: new Vector3(1024, 1024, 0),
      },
      jitter: {
        value: 0.8,
      },
      albedo: {
        value: materials.Material__67.map,
      },
    }),
    []
  );

  const [dummy] = useState(() => new THREE.Object3D());
  useFrame((state, dt) => {
    if (!groupRef.current) return;
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
        >
          <shaderMaterial
            uniforms={hatUniforms}
            fragmentShader={frag}
            vertexShader={vert}
          />
        </mesh>
        <mesh
          name="Original"
          castShadow
          receiveShadow
          geometry={nodes.Original.geometry}
          material={materials.Head}
          scale={0.056}
        >
          <shaderMaterial
            uniforms={faceUniforms}
            fragmentShader={frag}
            vertexShader={vert}
          />
        </mesh>
      </group>
    </group>
  );
};

useGLTF.preload("/Gump.glb");

export default Gump;
