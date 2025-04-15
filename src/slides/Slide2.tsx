import { Box, Text3D, Float, Gltf, useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import { degToRad } from "three/src/math/MathUtils.js";
import Gump from "../models/Gump";
import frag from "../Shaders/psx.frag";
import vert from "../Shaders/psx.vert";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};
const Slide1 = ({ position, index }: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const [slideIndex] = useAtom(slideShowIndex);
  const groupPosition = useMemo(() => position.add(POS_OFFSET), [position]);

  useFrame(() => {
    if (groupRef.current) {
      const newPosition = (index - slideIndex) * 10;
      //   console.log(groupRef.current.position, groupPosition);
      groupRef.current.position.lerp(
        new Vector3(
          newPosition + POS_OFFSET.x,
          groupPosition.y,
          groupPosition.z
        ),
        0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={groupPosition}>
      {/* <Float
        scale={[0.25, 0.25, 0.25]}
        position={[-0.5, 0, 0]}
        floatingRange={[-0.05, 0.05]}
      >
        <Text3D
          font={"/public/JetBrains Mono_Regular.json"}
          bevelEnabled
          castShadow
        >
          {"An Introduction to Web3D"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>
      <Float
        scale={[0.2, 0.2, 0.2]}
        position={[-1, -1, 0]}
        floatingRange={[-0.05, 0.05]}
        rotationIntensity={0.1}
      >
        <Text3D
          font={"/public/JetBrains Mono_Regular.json"}
          bevelEnabled
          castShadow
        >
          {"with Ethan Crann"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float> */}
      {/* <primitive
        ref={meshRef}
        object={scene}
        scale={[6, 6, 6]}
        rotation={[0, degToRad(-90), 0]}
      /> */}
      <Gump position={[2, -1, 0]} scale={[8, 8, 8]}></Gump>
    </group>
  );
};

export default Slide1;
