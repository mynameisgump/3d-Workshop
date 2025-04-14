import { Box, Text3D, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { slideShowIndex } from "./atoms/atoms";
import { useAtom } from "jotai";
const POS_OFFSET = new Vector3(-1.5, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};
const Slide1 = ({ position, index }: SlideProps) => {
  const boxRef = useRef<Mesh>(null);
  const groupRef = useRef<Mesh>(null);
  const [slideIndex] = useAtom(slideShowIndex);

  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.y += 0.01;
    }
    if (groupRef.current) {
      const newPosition = (index - slideIndex) * 10;
      groupRef.current.position.lerp(
        new Vector3(newPosition, position.y, position.z).add(POS_OFFSET),
        0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float
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
      </Float>
      <Box ref={boxRef} position={[5, -2, 0]} rotation={[0, 0, 0]} castShadow />
    </group>
  );
};

export default Slide1;
