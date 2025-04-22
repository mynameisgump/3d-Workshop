import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  PerspectiveCamera,
  OrthographicCamera,
  OrbitControls,
} from "@react-three/drei";
import CodeScreens from "./models/CodeScreens"; // Assuming this path is correct
import { degToRad } from "three/src/math/MathUtils.js";

// --- Constants ---
const MOUSE_SENSITIVITY_X = 0.1;
const MOUSE_SENSITIVITY_Y = 0.08;
const LERP_FACTOR = 0.05; // For mouse look smoothing
const TRANSITION_DURATION = 0.8; // Duration of camera switch animation in seconds
const ORTHO_ZOOM = 1; // Adjust this for desired orthographic view size
const ORTHO_POSITION = new THREE.Vector3(0, 0, 2); // Position for orthographic view
const PERSPECTIVE_POSITION = new THREE.Vector3(0, 0, 8); // Initial perspective position
const PERSPECTIVE_FOV = 50; // Default PerspectiveCamera FOV used by drei

// --- Easing Function ---
// (Quadratic Ease In Out)
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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

  // --- Refs ---
  // Mouse input refs
  const mousePositionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetMouseRotationRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const currentMouseRotationRef = useRef<THREE.Vector2>(
    new THREE.Vector2(0, 0)
  );

  // Camera refs
  const perspCamRef = useRef<THREE.PerspectiveCamera>(null!);
  const orthoCamRef = useRef<THREE.OrthographicCamera>(null!);

  // Transition state refs
  const transitionState = useRef({
    startTime: 0,
    startPosition: new THREE.Vector3(),
    startQuaternion: new THREE.Quaternion(),
    targetPosition: new THREE.Vector3(),
    targetQuaternion: new THREE.Quaternion(),
    startFov: PERSPECTIVE_FOV, // Store initial FOV
    targetFov: PERSPECTIVE_FOV,
    startZoom: 1, // Ortho starts with zoom=1 internally before scaling
    targetZoom: ORTHO_ZOOM,
  });

  // Keep track of the base rotation provided initially
  const initialRotationEuler = useMemo(
    () => new THREE.Euler(...initialRotation, "YXZ"),
    [initialRotation]
  );

  // --- Hooks ---
  const { size, clock } = useThree(); // Get viewport size and clock

  // --- Effects ---
  // Mouse move listener
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Only update if not transitioning and in perspective mode
      if (!isTransitioning && cameraType === "perspective") {
        mousePositionRef.current.x =
          2 * (event.clientX / window.innerWidth) - 1;
        mousePositionRef.current.y =
          2 * (event.clientY / window.innerHeight) - 1;
      } else {
        // Reset mouse position refs during transition or in ortho mode to prevent jumps
        mousePositionRef.current.set(0, 0);
        targetMouseRotationRef.current.set(0, 0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isTransitioning, cameraType]); // Re-run if transition state or camera type changes

  // Keyboard listener for camera switch
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isTransitioning) {
        setIsTransitioning(true);
        transitionState.current.startTime = clock.getElapsedTime();

        const nextType =
          cameraType === "perspective" ? "orthographic" : "perspective";
        const currentCam =
          cameraType === "perspective"
            ? perspCamRef.current
            : orthoCamRef.current;

        // Store starting state (current camera's world state)
        currentCam.getWorldPosition(transitionState.current.startPosition);
        currentCam.getWorldQuaternion(transitionState.current.startQuaternion);

        if (nextType === "orthographic") {
          // Target: Orthographic
          transitionState.current.targetPosition.copy(ORTHO_POSITION);
          // Keep current rotation for the ortho target
          transitionState.current.targetQuaternion.copy(
            transitionState.current.startQuaternion
          );
          transitionState.current.startZoom = orthoCamRef.current?.zoom || 1; // Use current if available
          transitionState.current.targetZoom = ORTHO_ZOOM;
          // FOV isn't relevant for the *target* ortho, but store current persp FOV
          transitionState.current.startFov =
            perspCamRef.current?.fov || PERSPECTIVE_FOV;
          transitionState.current.targetFov = transitionState.current.startFov; // Fov doesn't change during transition *to* ortho
        } else {
          // Target: Perspective
          transitionState.current.targetPosition.copy(PERSPECTIVE_POSITION);
          // Keep current rotation for the perspective target
          transitionState.current.targetQuaternion.copy(
            transitionState.current.startQuaternion
          );
          transitionState.current.startZoom =
            orthoCamRef.current?.zoom || ORTHO_ZOOM;
          transitionState.current.targetZoom = 1; // Perspective doesn't use zoom this way
          transitionState.current.startFov =
            perspCamRef.current?.fov || PERSPECTIVE_FOV; // Use current fov
          transitionState.current.targetFov = PERSPECTIVE_FOV; // Target the desired perspective FOV
        }

        setCameraType(nextType); // Trigger the switch
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning, cameraType, clock]); // Depend on current state

  // --- Frame Loop Logic ---
  useFrame((state, delta) => {
    const activeCamera = state.camera; // The currently active camera (set by makeDefault)

    if (isTransitioning) {
      const elapsedTime =
        clock.getElapsedTime() - transitionState.current.startTime;
      const progress = Math.min(elapsedTime / TRANSITION_DURATION, 1.0);
      const easedProgress = easeInOutQuad(progress); // Apply easing

      // Interpolate Position
      activeCamera.position.lerpVectors(
        transitionState.current.startPosition,
        transitionState.current.targetPosition,
        easedProgress
      );

      // Interpolate Rotation (using Slerp for quaternions)
      activeCamera.quaternion.slerpQuaternions(
        transitionState.current.startQuaternion,
        transitionState.current.targetQuaternion,
        easedProgress
      );

      // Interpolate FOV (for perspective target) or Zoom (for orthographic target)
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

      // IMPORTANT: Update projection matrix after changing FOV or Zoom
      activeCamera.updateProjectionMatrix();

      // End transition
      if (progress >= 1.0) {
        setIsTransitioning(false);
        // Snap to final values to avoid floating point inaccuracies
        activeCamera.position.copy(transitionState.current.targetPosition);
        activeCamera.quaternion.copy(transitionState.current.targetQuaternion);
        if (activeCamera.type === "PerspectiveCamera") {
          (activeCamera as THREE.PerspectiveCamera).fov =
            transitionState.current.targetFov;
        } else if (activeCamera.type === "OrthographicCamera") {
          (activeCamera as THREE.OrthographicCamera).zoom =
            transitionState.current.targetZoom;
        }
        activeCamera.updateProjectionMatrix();

        // Reset mouse look refs after transition completes
        currentMouseRotationRef.current.set(0, 0);
        targetMouseRotationRef.current.set(0, 0);
      }
    } else if (cameraType === "perspective") {
      // Apply mouse look only when not transitioning and in perspective mode
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

      // Apply base rotation + mouse look rotation
      // Note: We apply rotation directly to the active camera
      activeCamera.rotation.copy(initialRotationEuler); // Start with initial base rotation
      activeCamera.rotateY(currentMouseRotationRef.current.x); // Apply yaw (Y-axis)
      activeCamera.rotateX(currentMouseRotationRef.current.y); // Apply pitch (X-axis)
    }
    // No mouse look update needed in orthographic mode in this example
    // or if transitioning
  });

  // Calculate Orthographic camera frustum based on viewport size
  // Ensures the ortho view covers a similar area regardless of aspect ratio
  const aspect = size.width / size.height;
  const frustumSize = 5; // Adjust this to control the vertical size of the ortho view
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
      {/* Perspective Camera */}
      <PerspectiveCamera
        ref={perspCamRef}
        makeDefault={cameraType === "perspective"} // Active if perspective mode
        position={PERSPECTIVE_POSITION} // Initial position
        fov={PERSPECTIVE_FOV}
        near={0.1}
        far={1000}
      >
        {/* Place children only if they should be parented to THIS camera */}
        {/* It's often better to have scene content outside the camera component */}
      </PerspectiveCamera>

      {/* Orthographic Camera */}
      <OrthographicCamera
        ref={orthoCamRef}
        makeDefault={cameraType === "orthographic"} // Active if orthographic mode
        position={ORTHO_POSITION} // Initial position (will be overridden by transition)
        zoom={ORTHO_ZOOM} // Initial zoom
        {...orthoProps} // Apply calculated frustum props
      >
        {/* Place children only if they should be parented to THIS camera */}
      </OrthographicCamera>
      <OrbitControls></OrbitControls>
      {/* Scene Content - Place it OUTSIDE the cameras */}
      {/* The active camera will view this content */}
      {/* <CodeScreens position={[0, 2, -2]} rotation={[0, 0, degToRad(180)]} /> */}
      {/* Add other scene elements here */}
    </>
  );
};

export default UserControls;
