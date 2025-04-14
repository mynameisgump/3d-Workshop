import { Box, Text3D, OrbitControls, Center, Float } from "@react-three/drei";

const Slide1 = () => {
  return (
    <group position={[-2.8, 1, 0]}>
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
      <Box position={[5, -2, 0]} rotation={[0, 0, 0]} />
    </group>
  );
};

export default Slide1;
