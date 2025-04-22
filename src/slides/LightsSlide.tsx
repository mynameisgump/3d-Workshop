import { Text3D, Float, useHelper } from "@react-three/drei";
import { useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, SpotLight, Vector3, PointLight, DirectionalLight } from "three";
import { slideShowIndex } from "../atoms/atoms";
import { useAtom } from "jotai";
import {
  SpotLightHelper,
  PointLightHelper,
  DirectionalLightHelper,
  Object3D,
} from "three";
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
  const spotLightRef = useRef<SpotLight>();
  const pointLightRef = useRef<PointLight>();
  const directionalLightRef = useRef<DirectionalLight>();

  // Create helpers for each light type

  const [slideIndex] = useAtom(slideShowIndex);
  const [lightMode, setLightMode] = useState(2); // Default to spotlight (2)
  let spotLightHelperScale = 0;
  if (lightMode === 2) {
    spotLightHelperScale = 3;
  }
  useHelper(spotLightRef, SpotLightHelper, spotLightHelperScale);

  let pointLightHelperScale = 0;
  if (lightMode === 1) {
    pointLightHelperScale = 0.1;
  }
  useHelper(pointLightRef, PointLightHelper, pointLightHelperScale);

  let directionalHelperScale = 0;
  if (lightMode === 3) {
    directionalHelperScale = 1;
  }
  useHelper(
    directionalLightRef,
    DirectionalLightHelper,
    directionalHelperScale
  );

  const groupPosition = useMemo(
    () => position.clone().add(POS_OFFSET),
    [position]
  );

  // Handle keyboard input for switching light modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") {
        setLightMode(1); // Point light
      } else if (e.key === "2") {
        setLightMode(2); // Spot light
      } else if (e.key === "3") {
        setLightMode(3); // Directional light
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  // For point light animation
  useFrame(({ clock }) => {
    if (pointLightRef.current && lightMode === 1) {
      // Move point light left and right
      pointLightRef.current.position.x = Math.sin(clock.elapsedTime) * 3 + 2;
    }
  });

  // For spotlight control
  const [dummy] = useState(() => new Object3D());
  useFrame((state, dt) => {
    if (spotLightRef.current && lightMode === 2) {
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
      spotLightRef.current.target.position.copy(dummy.position);
      spotLightRef.current.target.updateMatrixWorld();
      // Smooth rotation
      dummy.lookAt(targetPos);
      easing.dampQ(spotLightRef.current.quaternion, dummy.quaternion, 0.15, dt);
    }

    // For directional light control
    if (directionalLightRef.current && lightMode === 3) {
      // Convert mouse position to directional light position
      const xPos = state.pointer.x * 5;
      const yPos = Math.max(0.5, state.pointer.y * 5); // Keep it at least slightly above

      // Update directional light position
      directionalLightRef.current.position.x = xPos;
      directionalLightRef.current.position.y = yPos;

      // Make it always point at the center
      directionalLightRef.current.target.position.set(0, 0, 0);
      directionalLightRef.current.target.updateMatrixWorld();
    }
  });

  // Get the appropriate light text based on mode
  const getLightText = () => {
    switch (lightMode) {
      case 1:
        return "Point";
      case 2:
        return "Spotlight";
      case 3:
        return "Directional";
      default:
        return "Lights";
    }
  };

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
        <Float
          scale={[0.25, 0.25, 0.25]}
          position={[-0.5, -1, 0]}
          floatingRange={[-0.05, 0.05]}
        >
          <Text3D
            font={"/public/JetBrains Mono_Regular.json"}
            bevelEnabled
            castShadow
            position={[8.25, 5.94709176009217, -1.10116762973478]}
          >
            {getLightText()}
            <meshStandardMaterial side={2} />
          </Text3D>
        </Float>

        {/* Point Light - visible when mode is 1 */}
        {lightMode === 1 && (
          <pointLight
            ref={pointLightRef}
            position={[0, 0, 3]}
            intensity={500}
            distance={50}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#ff9900"
          />
        )}

        {/* Spot Light - visible when mode is 2 */}
        {lightMode === 2 && (
          <spotLight
            ref={spotLightRef}
            position={[1.98, -1.31, 3]}
            angle={Math.PI / 8}
            penumbra={1}
            intensity={1000}
            distance={100}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#ffffff"
          />
        )}

        {/* Directional Light - visible when mode is 3 */}
        {lightMode === 3 && (
          <directionalLight
            ref={directionalLightRef}
            position={[0, 0, 0]}
            intensity={2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#4466ff"
          />
        )}

        {/* Add a cube to visualize the lighting effect */}
        <group position={[1, 0, 0]}>
          <mesh
            position={[0.53, -2.18, 0]}
            castShadow
            receiveShadow
            rotation={[0, -0.8028514559173923, 0]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#a0a0a0"
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          <mesh
            position={[1.87, -2.18, 0]}
            castShadow
            receiveShadow
            rotation={[0, -0.45378560551852576, 0]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#a0a0a0"
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          <mesh
            position={[1.12, -1.22, 0]}
            castShadow
            receiveShadow
            rotation={[0, -0.349065850398866, 0]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#a0a0a0"
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
        </group>
      </group>
    </>
  );
};

export default LightsSlide;
