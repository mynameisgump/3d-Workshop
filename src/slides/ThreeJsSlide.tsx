import { Text3D, Float, Html, useBounds, useGLTF } from "@react-three/drei";
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

const ThreeJsSlide = ({
  position = new Vector3(0, 0, 0),
  index = 0,
}: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const [slideIndex] = useAtom(slideShowIndex);
  const { scene } = useGLTF("/threeLogo.glb");

  let selected = false;
  if (slideIndex == index) {
    selected = true;
  }

  const [screenSelected, setScreenSelected] = useState(false);

  const bounds = useBounds();
  // useEffect(() => {
  //   // Calculate scene bounds
  //   bounds.refresh().clip().fit()
  // }, [...]

  const handleClick = useCallback(() => {
    setScreenSelected((prev) => !prev);
    console.log("Testin");
    bounds.refresh(ref.current).clip().fit();
  }, [bounds]);

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
          position={[6.3, 3.16052429594125, -0.565588082446015]}
          rotation={[
            0.40087964175879354, -0.003909933371310533, 0.021517192231723853,
          ]}
        >
          {"three.js"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>
      <primitive scale={[4, 4, 4]} object={scene}></primitive>
    </group>
  );
};

export default ThreeJsSlide;
