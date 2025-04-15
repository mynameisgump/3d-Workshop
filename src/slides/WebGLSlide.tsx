import { Box, Text3D, Float, Html } from "@react-three/drei";
import { useCallback, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};

const WebGlSlide = ({
  position = new Vector3(0, 0, 0),
  index = 0,
}: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const [slideIndex] = useAtom(slideShowIndex);
  const [screenSelected, setScreenSelected] = useState(false);
  let pointerEvents = "none";
  if (screenSelected) {
    pointerEvents = "all";
  }

  const handleClick = useCallback(() => {
    setScreenSelected((prev) => !prev);
  }, []);

  const groupPosition = useMemo(
    () => position.clone().add(POS_OFFSET),
    [position]
  );
  //   console.log(groupPosition);

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
        >
          {"An Introduction to Web3D"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>

      <Float
        floatIntensity={1}
        rotationIntensity={1}
        position={[-1, -1, 0]}
        onClick={handleClick}
      >
        <Html
          style={{ userSelect: "none" }}
          castShadow
          receiveShadow
          occlude="blending"
          transform
          scale={0.1}
          distanceFactor={10}
        >
          <iframe
            title="embed"
            width={1080}
            height={1080}
            src="https://threejs.org/"
            frameBorder={0}
            style={{ pointerEvents: pointerEvents }}
          />
        </Html>
      </Float>
    </group>
  );
};

export default WebGlSlide;
