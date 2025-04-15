import { useRef, useEffect } from "react";
import { CameraControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MOUSE_SENSITIVITY_X = 0.1;
const MOUSE_SENSITIVITY_Y = 0.08;
const LERP_FACTOR = 0.05;
interface PlayerControllerProps {
  initialRotation?: [number, number, number];
}

const UserControls = ({
  initialRotation = [0, 0, 0],
}: PlayerControllerProps) => {
  const controlsRef = useRef<CameraControls | null>(null);

  const targetMouseRotationRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  const currentMouseRotationRef = useRef<THREE.Vector2>(
    new THREE.Vector2(0, 0)
  );
  const initialRotationRef = useRef<THREE.Euler>(
    new THREE.Euler(...initialRotation, "YXZ")
  );

  useEffect(() => {
    initialRotationRef.current.set(
      initialRotation[0],
      initialRotation[1],
      initialRotation[2],
      "YXZ"
    );
  }, [initialRotation]);

  useFrame((state) => {
    if (controlsRef.current) {
      const mouseX = state.pointer.x;
      const mouseY = state.pointer.y;

      targetMouseRotationRef.current.x = -mouseX * MOUSE_SENSITIVITY_X;
      targetMouseRotationRef.current.y = mouseY * MOUSE_SENSITIVITY_Y;

      currentMouseRotationRef.current.x = THREE.MathUtils.lerp(
        currentMouseRotationRef.current.x,
        targetMouseRotationRef.current.x,
        LERP_FACTOR
      );
      currentMouseRotationRef.current.y = THREE.MathUtils.lerp(
        currentMouseRotationRef.current.y,
        targetMouseRotationRef.current.y,
        LERP_FACTOR
      );

      const camera = controlsRef.current.camera;

      camera.rotation.copy(initialRotationRef.current);

      camera.rotateY(currentMouseRotationRef.current.x);
      camera.rotateX(currentMouseRotationRef.current.y);
    }
  });

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.azimuthRotateSpeed = 0;
      controlsRef.current.polarRotateSpeed = 0;

      controlsRef.current.camera.rotation.set(
        initialRotation[0],
        initialRotation[1],
        initialRotation[2],
        "YXZ"
      );

      controlsRef.current.update(0);
    }
  }, [initialRotation]);

  return <CameraControls ref={controlsRef} />;
};

export default UserControls;
