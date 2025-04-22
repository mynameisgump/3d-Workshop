import {
  Text3D,
  Float,
  PerspectiveCamera,
  useHelper,
  OrthographicCamera,
} from "@react-three/drei";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Camera, CameraHelper, Mesh, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import { degToRad } from "three/src/math/MathUtils.js";
import { currentCamera } from "../atoms/atoms";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};

const CameraSlide = ({ position, index }: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const cameraRef = useRef(null);
  const orthoRef = useRef<Camera>(null);
  const [slideIndex] = useAtom(slideShowIndex);
  const [curCam] = useAtom(currentCamera);
  const groupPosition = useMemo(
    () => position.clone().add(POS_OFFSET),
    [position]
  );
  useHelper(cameraRef, CameraHelper);
  useHelper(orthoRef, CameraHelper);

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
    cameraRef.current.rotation.y += 0.01;
    orthoRef.current.rotation.y += 0.01;
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
          {"Camera"}
          <meshStandardMaterial side={2} />
        </Text3D>
      </Float>

      <PerspectiveCamera
        ref={cameraRef}
        far={1}
        rotation={[0, degToRad(180), 0]}
        position={[3, 0, 0]}
        scale={curCam === "perspective" ? [1, 1, 1] : [0, 0, 0]}
      ></PerspectiveCamera>

      <OrthographicCamera
        ref={orthoRef}
        far={1}
        left={-0.2}
        right={0.2}
        top={0.2}
        bottom={-0.2}
        rotation={[0, degToRad(180), 0]}
        position={[3, 0, 0]}
        scale={curCam === "orthographic" ? [1, 1, 1] : [0, 0, 0]}
      ></OrthographicCamera>
    </group>
  );
};

export default CameraSlide;
