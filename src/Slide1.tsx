import { Box, Text3D, OrbitControls, Center, Float } from "@react-three/drei";

const Slide1 = () => {
  return (
    // <Center top>
    <group position={[-2.8, 2, 0]}>
      <Float
        scale={[0.25, 0.25, 0.25]}
        position={[-0.5, 0, 0]}
        floatingRange={[-0.05, 0.05]}
      >
        <Text3D
          font={"/public/JetBrains Mono_Regular.json"}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0.5}
          lineHeight={1}
          letterSpacing={-0.06}
          size={1.5}
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
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0.5}
          lineHeight={1}
          letterSpacing={-0.06}
          size={1.5}
          castShadow
        >
          {"with Ethan Crann"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>
      <Box position={[5, -2, 0]} rotation={[0, 0, 0]} />
    </group>
    // </Center>
  );
};

export default Slide1;
