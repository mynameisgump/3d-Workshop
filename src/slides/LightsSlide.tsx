import {
  Text3D,
  Float,
  Gltf,
  Wireframe,
  Plane,
  useHelper,
} from "@react-three/drei";
import { use, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, MeshToonMaterial, PointLight, SpotLight, Vector3 } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import Gump from "../models/Gump";
import GumpWireframe from "../models/GumpWireframe";
import GumpMaterial from "../models/GumpMaterial";
import { PointLightHelper, SpotLightHelper, Object3D } from "three";
import { easing } from "maath";

const POS_OFFSET = new Vector3(-2, 0.7, 0);

type SlideProps = {
  position: Vector3;
  index: number;
};

const LightsSlide = ({
  position = new Vector3(0, 0, 0),
  index = 0,
}: SlideProps) => {
  const groupRef = useRef<Mesh>(null);
  const lightRef = useRef<SpotLight>();
  useHelper(lightRef, SpotLightHelper);

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
  const [dummy] = useState(() => new Object3D());
  useFrame((state, dt) => {
    if (!lightRef.current) return;

    // Set how far in front of the camera you want the spotlight to point
    const depth = 10;

    // Create a world position from the mouse coordinates at a certain depth
    const mouse = new Vector3(state.pointer.x, state.pointer.y, 0.5);
    mouse.unproject(state.camera);

    // Get camera direction
    const cameraDirection = new Vector3();
    state.camera.getWorldDirection(cameraDirection);

    // Ray from camera toward mouse direction
    const cameraPos = state.camera.position.clone();
    const dir = mouse.sub(cameraPos).normalize();
    const targetPos = cameraPos.add(dir.multiplyScalar(depth));

    // Move dummy to that point in space
    dummy.position.copy(targetPos);

    // Update spotlight target to follow dummy
    lightRef.current.target.position.copy(dummy.position);
    lightRef.current.target.updateMatrixWorld();

    // Smooth rotation
    dummy.lookAt(targetPos);
    easing.dampQ(lightRef.current.quaternion, dummy.quaternion, 0.15, dt);
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
            {"Lights"}
            <meshStandardMaterial side={2} />
          </Text3D>
        </Float>
        <spotLight
          ref={lightRef}
          position={[1, -2, 3]}
          angle={Math.PI / 8}
          penumbra={1}
          intensity={1000}
          distance={100}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        ></spotLight>
      </group>
    </>
  );
};

export default LightsSlide;
