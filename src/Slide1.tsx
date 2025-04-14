import { Box, Text3D, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Mesh, Vector3 } from "three";
const POS_OFFSET = new Vector3(-1.5, 0.7, 0);

type SlideProps = {
  position: Vector3;
};
const Slide1 = ({ position }: SlideProps) => {
  const boxRef = useRef<Mesh>(null);

  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position.add(POS_OFFSET)}>
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
