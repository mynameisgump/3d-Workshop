import {
  Text3D,
  Float,
  Gltf,
  Wireframe,
  Plane,
  useHelper,
} from "@react-three/drei";
import { use, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, MeshToonMaterial, PointLight, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import Gump from "../models/Gump";
import GumpWireframe from "../models/GumpWireframe";
import GumpMaterial from "../models/GumpMaterial";
import { PointLightHelper } from "three";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};

const MeshSlide = ({
  position = new Vector3(0, 0, 0),
  index = 0,
}: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>();
  useHelper(lightRef, PointLightHelper);

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
            position={[8.25, 5.94709176009217, -1.10116762973478]}
          >
            {"Meshes"}
            <meshStandardMaterial side={2} />
          </Text3D>
        </Float>
        <Float
          scale={[0.25, 0.25, 0.25]}
          position={[-0.5, 0, 0]}
          floatingRange={[-0.05, 0.05]}
        >
          <Text3D
            font={"/public/JetBrains Mono_Regular.json"}
            bevelEnabled
            castShadow
            position={[-0.67, 1.99249744715171, -0.647159669448014]}
          >
            {"Geometry"}
            <meshStandardMaterial side={2} />
            {/* <Gump scale={}></Gump> */}
            <GumpWireframe
              scale={[35.58, 35.58, 35.58]}
              position={[
                3.42266716536162, -5.78218595940734, 0.00170165305316408,
              ]}
            ></GumpWireframe>
          </Text3D>
        </Float>
        <Float
          scale={[0.25, 0.25, 0.25]}
          position={[-0.5, 0, 0]}
          floatingRange={[-0.05, 0.05]}
        >
          <Text3D
            font={"/public/JetBrains Mono_Regular.json"}
            bevelEnabled
            castShadow
            position={[15.21, 2.43740679393462, -2.0490184731044]}
          >
            {"Material"}
            <meshStandardMaterial side={2} />
            <GumpMaterial
              scale={[35.58, 35.58, 35.58]}
              position={[
                3.42266716536162, -5.78218595940734, 0.00170165305316408,
              ]}
            ></GumpMaterial>
            <pointLight
              ref={lightRef}
              position={[3.19792655672542, -6.38430890785739, 5.63126044108684]}
              intensity={3}
            ></pointLight>
          </Text3D>
        </Float>
      </group>
    </>
  );
};

export default MeshSlide;
