import { Text3D, Float } from "@react-three/drei";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import { Dolls } from "../models/Dolls";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};

const DollsSlide = ({
  position = new Vector3(0, 0, 0),
  index = 0,
}: SlideProps) => {
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
    <group ref={groupRef} position={groupPosition}>
      <Float
        scale={[0.25, 0.25, 0.25]}
        position={[-0.5, 0, 0]}
        floatingRange={[-0.05, 0.05]}
      >
        <Text3D
          font={"/public/JetBrains Mono_Regular.json"}
          bevelEnabled
          castShadow
          position={[3.69, 3.29554530728606, 0.484356707554348]}
        >
          {"What is Web3D?"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>
      <Dolls
        position={[0.19, -2.58, 0.0787604520397187]}
        scale={[0.78, 0.78, 0.78]}
        rotation={[0, -1.5707963267948966, 0]}
      ></Dolls>
    </group>
  );
};

export default DollsSlide;
