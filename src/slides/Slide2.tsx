import { useMemo } from "react";
import { Float, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import Gump from "../models/Gump";

const POS_OFFSET = new Vector3(-4.2, 2, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};
const Slide1 = ({ position = new Vector3(0, 0, 0), index = 0 }: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const [slideIndex] = useAtom(slideShowIndex);
  const groupPosition = useMemo(
    () => position.clone().add(POS_OFFSET),
    [position]
  );

  useFrame(() => {
    if (groupRef.current) {
      const newPosition = (index - slideIndex) * 10;
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
    <group ref={groupRef} position={groupPosition} scale={[2, 2, 2]}>
      <Float
        scale={[0.2, 0.2, 0.2]}
        position={[1.5, 1, 0]}
        floatingRange={[-0.05, 0.05]}
        rotationIntensity={0.1}
      >
        <Text3D
          font={"/public/JetBrains Mono_Regular.json"}
          bevelEnabled
          castShadow
          position={[-2.98541867373539, -2.98684199230617, -0.0449897886675091]}
        >
          {"My Background"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>
      <Gump position={[2, -1, 0]} scale={[8, 8, 8]}></Gump>
    </group>
  );
};

export default Slide1;
