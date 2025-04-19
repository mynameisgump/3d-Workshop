import { Box, Text3D, Float, Html, useBounds } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useState } from "react";
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

  const bounds = useBounds();
  // useEffect(() => {
  //   // Calculate scene bounds
  //   bounds.refresh().clip().fit()
  // }, [...])

  const handleClick = useCallback(() => {
    setScreenSelected((prev) => !prev);
    bounds.refresh(ref.current).clip().fit();
  }, []);

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
        position={[-0.5, 1.5, 0]}
        floatingRange={[-0.05, 0.05]}
      >
        <Text3D
          font={"/public/JetBrains Mono_Regular.json"}
          bevelEnabled
          castShadow
        >
          {"The WebGL Triangle"}
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
          scale={0.3}
          distanceFactor={10}
          onClick={handleClick}
          position={[1.3, -0.5, 0]}
        >
          <iframe
            title="embed"
            width={640}
            height={480}
            src="https://webglworkshop.com/28/01-triangle-webgl2.html"
            frameBorder={0}
            style={{ pointerEvents: pointerEvents }}
          />
        </Html>
      </Float>
    </group>
  );
};

export default WebGlSlide;
