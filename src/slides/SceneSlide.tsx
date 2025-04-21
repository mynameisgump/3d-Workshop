import {
  Box,
  Text3D,
  Float,
  useHelper,
  PerspectiveCamera,
} from "@react-three/drei";
import { use, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, PointLight, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import { CameraHelper, PointLightHelper } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};

const SceneSlide = ({
  position = new Vector3(0, 0, 0),
  index = 0,
}: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const cameraRef = useRef(null);
  const lightRef = useRef<PointLight>(null);
  useHelper(cameraRef, CameraHelper);
  useHelper(lightRef, PointLightHelper, 0.5, "red");
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
    cameraRef.current.rotation.y += 0.001;
  });

  return (
    <>
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
            position={[
              -0.283198572287881, 5.53245098445633, -0.060751301400248,
            ]}
          >
            {"Structure of a Scene"}
            <meshStandardMaterial side={2} />
          </Text3D>
        </Float>
        <Float
          scale={[0.25, 0.25, 0.25]}
          position={[0.79, -1.01, 0]}
          floatingRange={[-0.05, 0.05]}
        >
          <Text3D
            font={"/public/JetBrains Mono_Regular.json"}
            bevelEnabled
            castShadow
            position={[
              -0.283198572287881, 5.53245098445633, -0.060751301400248,
            ]}
          >
            {"Meshes"}
            <meshStandardMaterial side={2} />
          </Text3D>
        </Float>
        <Float
          scale={[0.25, 0.25, 0.25]}
          position={[-1.01, -1.01, 0]}
          floatingRange={[-0.05, 0.05]}
        >
          <Text3D
            font={"/public/JetBrains Mono_Regular.json"}
            bevelEnabled
            castShadow
            position={[
              -0.283198572287881, 5.53245098445633, -0.060751301400248,
            ]}
          >
            {"Lights"}
            <meshStandardMaterial side={2} />
          </Text3D>
          <pointLight
            ref={lightRef}
            position={[2, 2, 0]}
            intensity={100}
          ></pointLight>
        </Float>
        <Float
          scale={[0.25, 0.25, 0.25]}
          position={[2.65, -1.05, 0]}
          floatingRange={[-0.05, 0.05]}
        >
          <Text3D
            font={"/public/JetBrains Mono_Regular.json"}
            bevelEnabled
            castShadow
            position={[
              -0.283198572287881, 5.53245098445633, -0.060751301400248,
            ]}
          >
            {"Cameras"}
            <meshStandardMaterial side={2} />
          </Text3D>
          <PerspectiveCamera
            ref={cameraRef}
            //   scale={[0.01, 0.01, 0.01]}
            far={1}
            rotation={[0, degToRad(180), 0]}
            position={[3, 3, 0]}
            scale={[3, 3, 3]}
          ></PerspectiveCamera>
        </Float>

        <mesh position={[1.45, -0.5, 0]}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </group>
    </>
  );
};

export default SceneSlide;
