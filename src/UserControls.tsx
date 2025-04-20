import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import CodeScreens from "./models/CodeScreens";
import { degToRad } from "three/src/math/MathUtils.js";

const MOUSE_SENSITIVITY_X = 0.1;
const MOUSE_SENSITIVITY_Y = 0.08;
const LERP_FACTOR = 0.05;
interface PlayerControllerProps {
  initialRotation?: [number, number, number];
}

const UserControls = ({
  initialRotation = [0, 0, 0],
}: PlayerControllerProps) => {
  const mousePostionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetMouseRotationRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  const currentMouseRotationRef = useRef<THREE.Vector2>(
    new THREE.Vector2(0, 0)
  );
  const initialRotationRef = useRef<THREE.Euler>(
    new THREE.Euler(...initialRotation, "YXZ")
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePostionRef.current.x = 2 * (event.clientX / window.innerWidth) - 1;
      mousePostionRef.current.y = 2 * (event.clientY / window.innerHeight) - 1;
      // console.log(mousePostionRef.current);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    initialRotationRef.current.set(
      initialRotation[0],
      initialRotation[1],
      initialRotation[2],
      "YXZ"
    );
  }, [initialRotation]);

  useFrame((state) => {
    targetMouseRotationRef.current.x =
      -mousePostionRef.current.x * MOUSE_SENSITIVITY_X;
    targetMouseRotationRef.current.y =
      -mousePostionRef.current.y * MOUSE_SENSITIVITY_Y;

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

    const camera = state.camera;

    camera.rotation.copy(initialRotationRef.current);

    camera.rotateY(currentMouseRotationRef.current.x);
    camera.rotateX(currentMouseRotationRef.current.y);
  });

  return (
    <PerspectiveCamera position={[0, 0, 5.4]}>
      <CodeScreens
        position={[0, 2, -2]}
        rotation={[0, 0, degToRad(180)]}
      ></CodeScreens>
    </PerspectiveCamera>
  );
};

export default UserControls;
