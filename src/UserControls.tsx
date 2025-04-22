import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  PerspectiveCamera,
  OrthographicCamera,
  OrbitControls,
} from "@react-three/drei";
import CodeScreens from "./models/CodeScreens";
import { degToRad } from "three/src/math/MathUtils.js";

const MOUSE_SENSITIVITY_X = 0.1;
const MOUSE_SENSITIVITY_Y = 0.08;
const LERP_FACTOR = 0.05;
const TRANSITION_DURATION = 1.2;
const ORTHO_ZOOM = 0.3;

const ORTHO_POSITION = new THREE.Vector3(0, 0, 15);
const PERSPECTIVE_POSITION = new THREE.Vector3(0, 0, 8);
const PERSPECTIVE_FOV = 50;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface PlayerControllerProps {
  initialRotation?: [number, number, number];
}

const UserControls = ({
  initialRotation = [0, 0, 0],
}: PlayerControllerProps) => {
  // --- State ---
  const [cameraType, setCameraType] = useState<"perspective" | "orthographic">(
    "perspective"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetCameraType, setTargetCameraType] = useState<
    "perspective" | "orthographic"
  >("perspective");

  // --- Refs ---
  // Mouse input refs
  const mousePositionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetMouseRotationRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const currentMouseRotationRef = useRef<THREE.Vector2>(
    new THREE.Vector2(0, 0)
  );

  const perspCamRef = useRef<THREE.PerspectiveCamera>(null!);
  const orthoCamRef = useRef<THREE.OrthographicCamera>(null!);

  const transitionState = useRef({
    startTime: 0,
    startPosition: new THREE.Vector3(),
    startQuaternion: new THREE.Quaternion(),
    targetPosition: new THREE.Vector3(),
    targetQuaternion: new THREE.Quaternion(),
    startFov: PERSPECTIVE_FOV,
    targetFov: PERSPECTIVE_FOV,
    startZoom: 1,
    targetZoom: ORTHO_ZOOM,
  });

  const initialRotationEuler = useMemo(
    () => new THREE.Euler(...initialRotation, "YXZ"),
    [initialRotation]
  );

  const { size, clock } = useThree();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isTransitioning && cameraType === "perspective") {
        mousePositionRef.current.x =
          2 * (event.clientX / window.innerWidth) - 1;
        mousePositionRef.current.y =
          2 * (event.clientY / window.innerHeight) - 1;
      } else {
        mousePositionRef.current.set(0, 0);
        targetMouseRotationRef.current.set(0, 0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTransitioning, cameraType]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isTransitioning) {
        setIsTransitioning(true);
        transitionState.current.startTime = clock.getElapsedTime();

        const nextType =
          cameraType === "perspective" ? "orthographic" : "perspective";
        setTargetCameraType(nextType);

        const currentCam =
          cameraType === "perspective"
            ? perspCamRef.current
            : orthoCamRef.current;

        currentCam.getWorldPosition(transitionState.current.startPosition);
        currentCam.getWorldQuaternion(transitionState.current.startQuaternion);

        if (nextType === "orthographic") {
          transitionState.current.targetPosition.copy(currentCam.position);

          const lookDirection = new THREE.Vector3(0, 0, -1);
          lookDirection.applyQuaternion(currentCam.quaternion);

          lookDirection.multiplyScalar(-7);
          transitionState.current.targetPosition.add(lookDirection);

          transitionState.current.targetQuaternion.copy(
            transitionState.current.startQuaternion
          );

          transitionState.current.startZoom = orthoCamRef.current?.zoom || 1;
          transitionState.current.targetZoom = ORTHO_ZOOM;

          transitionState.current.startFov =
            perspCamRef.current?.fov || PERSPECTIVE_FOV;
          transitionState.current.targetFov = transitionState.current.startFov;

          orthoCamRef.current.position.copy(
            transitionState.current.targetPosition
          );
          orthoCamRef.current.quaternion.copy(
            transitionState.current.targetQuaternion
          );
          orthoCamRef.current.zoom = transitionState.current.targetZoom;
          orthoCamRef.current.updateProjectionMatrix();
        } else {
          transitionState.current.targetPosition.copy(currentCam.position);

          const lookDirection = new THREE.Vector3(0, 0, -1);
          lookDirection.applyQuaternion(currentCam.quaternion);

          lookDirection.multiplyScalar(7);
          transitionState.current.targetPosition.add(lookDirection);

          transitionState.current.targetQuaternion.copy(
            transitionState.current.startQuaternion
          );

          transitionState.current.startZoom =
            orthoCamRef.current?.zoom || ORTHO_ZOOM;
          transitionState.current.targetZoom = 1;

          transitionState.current.startFov =
            perspCamRef.current?.fov || PERSPECTIVE_FOV;
          transitionState.current.targetFov = PERSPECTIVE_FOV;

          perspCamRef.current.position.copy(
            transitionState.current.targetPosition
          );
          perspCamRef.current.quaternion.copy(
            transitionState.current.targetQuaternion
          );
          perspCamRef.current.fov = transitionState.current.targetFov;
          perspCamRef.current.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning, cameraType, clock]); // Depend on current state

  // --- Frame Loop Logic ---
  useFrame((state, delta) => {
    const activeCamera = state.camera;

    if (isTransitioning) {
      const elapsedTime =
        clock.getElapsedTime() - transitionState.current.startTime;
      const progress = Math.min(elapsedTime / TRANSITION_DURATION, 1.0);
      const easedProgress = easeInOutCubic(progress);

      // Interpolate Position
      activeCamera.position.lerpVectors(
        transitionState.current.startPosition,
        transitionState.current.targetPosition,
        easedProgress
      );

      activeCamera.quaternion.slerpQuaternions(
        transitionState.current.startQuaternion,
        transitionState.current.targetQuaternion,
        easedProgress
      );

      // Interpolate FOV/Zoom based on the currently active camera type
      if (activeCamera.type === "PerspectiveCamera") {
        const perspectiveCam = activeCamera as THREE.PerspectiveCamera;
        perspectiveCam.fov = THREE.MathUtils.lerp(
          transitionState.current.startFov,
          transitionState.current.targetFov,
          easedProgress
        );
      } else if (activeCamera.type === "OrthographicCamera") {
        const orthographicCam = activeCamera as THREE.OrthographicCamera;
        orthographicCam.zoom = THREE.MathUtils.lerp(
          transitionState.current.startZoom,
          transitionState.current.targetZoom,
          easedProgress
        );
      }

      activeCamera.updateProjectionMatrix();

      if (progress >= 1.0) {
        setCameraType(targetCameraType);

        if (targetCameraType === "orthographic") {
          orthoCamRef.current.position.copy(
            transitionState.current.targetPosition
          );
          orthoCamRef.current.quaternion.copy(
            transitionState.current.targetQuaternion
          );
          orthoCamRef.current.zoom = transitionState.current.targetZoom;
          orthoCamRef.current.updateProjectionMatrix();
        } else {
          perspCamRef.current.position.copy(
            transitionState.current.targetPosition
          );
          perspCamRef.current.quaternion.copy(
            transitionState.current.targetQuaternion
          );
          perspCamRef.current.fov = transitionState.current.targetFov;
          perspCamRef.current.updateProjectionMatrix();
        }

        setIsTransitioning(false);

        currentMouseRotationRef.current.set(0, 0);
        targetMouseRotationRef.current.set(0, 0);
      }
    } else if (cameraType === "perspective") {
      targetMouseRotationRef.current.x =
        -mousePositionRef.current.x * MOUSE_SENSITIVITY_X;
      targetMouseRotationRef.current.y =
        -mousePositionRef.current.y * MOUSE_SENSITIVITY_Y;

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

      activeCamera.rotation.copy(initialRotationEuler);
      activeCamera.rotateY(currentMouseRotationRef.current.x);
      activeCamera.rotateX(currentMouseRotationRef.current.y);
    }
  });

  const aspect = size.width / size.height;
  const frustumSize = 5;
  const orthoProps = {
    left: (frustumSize * aspect) / -2,
    right: (frustumSize * aspect) / 2,
    top: frustumSize / 2,
    bottom: frustumSize / -2,
    near: 0.1,
    far: 1000,
  };

  return (
    <>
      <PerspectiveCamera
        ref={perspCamRef}
        makeDefault={cameraType === "perspective"}
        position={PERSPECTIVE_POSITION}
        fov={PERSPECTIVE_FOV}
        near={0.1}
        far={1000}
      />

      <OrthographicCamera
        ref={orthoCamRef}
        makeDefault={cameraType === "orthographic"}
        position={ORTHO_POSITION}
        zoom={ORTHO_ZOOM}
        {...orthoProps}
      />

      {!isTransitioning && (
        <OrbitControls enabled={cameraType === "orthographic"} />
      )}
    </>
  );
};

export default UserControls;
