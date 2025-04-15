import { useRef, useEffect } from "react";
import { CameraControls } from "@react-three/drei"; // ACTION needed to disable inputs
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three"; // Used for Vector3 and MathUtils
import { CameraControlsProps } from "@react-three/drei";

const TestControls = () => {
  const controlsRef = useRef<CameraControls>(null);
  const { pointer } = useThree(); // Normalized pointer: x is in [-1, 1]

  // --- Configuration ---
  // Define the total horizontal rotation range based on mouse position.
  // Example: Math.PI / 8 means the view will rotate +/- (PI/8 / 2) radians from center.
  // Or interpreted as: pointer.x = -1 maps to -maxRotation, pointer.x = 1 maps to +maxRotation
  const maxHorizontalRotation = Math.PI / 10; // Smaller range, e.g., +/- 18 degrees

  // Define initial camera setup
  const initialCameraPosition = new THREE.Vector3(0, 1.5, 3); // Position the camera
  const initialTargetPosition = new THREE.Vector3(0, 1.5, 0); // Look straight ahead horizontally

  // --- Initial Setup ---
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      // Set the initial camera position and where it looks
      controls.setLookAt(
        initialCameraPosition.x,
        initialCameraPosition.y,
        initialCameraPosition.z,
        initialTargetPosition.x,
        initialTargetPosition.y,
        initialTargetPosition.z,
        false // Apply instantly without smooth transition
      );

      // Calculate the vertical angle (polar angle) of this initial view
      const lookAtVector = new THREE.Vector3().subVectors(
        initialTargetPosition,
        initialCameraPosition
      );
      // Calculate polar angle (angle from positive Y-axis) using acos(y / length)
      const initialPolarAngle = Math.acos(
        THREE.MathUtils.clamp(lookAtVector.y / lookAtVector.length(), -1, 1)
      );

      // Lock the vertical rotation by setting min and max polar angle to the initial value
      controls.minPolarAngle = initialPolarAngle;
      controls.maxPolarAngle = initialPolarAngle;

      // Optional: Save this state if you might reset to it later
      controls.saveState();
    }
  }, []); // Run once on mount

  // --- Frame Update ---
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Calculate the target horizontal angle (azimuth) based on mouse position.
    // We assume the initial setup faces azimuth 0 (common for camera at +Z looking at origin).
    // Adjust `centerAzimuth` if your initial setup points elsewhere horizontally.
    const centerAzimuth = 0;
    // Map pointer.x from [-1, 1] to [-maxHorizontalRotation, +maxHorizontalRotation] relative to center.
    // Negative sign might be needed depending on desired direction (mouse right -> look right/left?)
    // If mouse right (pointer.x=1) should make camera look right (positive azimuth), use +
    // If mouse right should make camera look left (negative azimuth), use -
    const targetAzimuth = centerAzimuth + pointer.x * maxHorizontalRotation; // Mouse right -> look right

    // Get the current horizontal angle
    const currentAzimuth = controls.azimuthAngle;

    // Calculate the difference needed to reach the target angle
    let deltaAzimuth = targetAzimuth - currentAzimuth;

    // Ensure we rotate via the shortest path (handle wrapping around +/- PI)
    const twoPi = Math.PI * 2;
    deltaAzimuth = (((deltaAzimuth % twoPi) + twoPi * 1.5) % twoPi) - Math.PI;

    // Apply only the horizontal rotation instantly (deltaPolar = 0, enableTransition = false)
    controls.rotate(deltaAzimuth, 0, false);
  });
  return (
    <CameraControls
      ref={controlsRef}
      // Disable mouse/touch inputs that allow user to drag/orbit/pan/zoom
      //   mouseButtons={{
      //     left: ACTION.NONE, // Disable left-click drag
      //     middle: ACTION.NONE, // Disable middle-click drag/zoom
      //     right: ACTION.NONE, // Disable right-click drag
      //     wheel: ACTION.NONE, // Disable scroll wheel zoom
      //   }}
      //   touches={{
      //     one: ACTION.NONE, // Disable one-finger touch drag
      //     two: ACTION.NONE, // Disable two-finger touch interactions (pinch zoom, etc.)
      //     three: ACTION.NONE, // Disable three-finger touch drag
      //   }}
      // Vertical angle limits are set dynamically in useEffect to lock vertical view
      // smoothTime={0} // Uncomment for absolutely zero smoothing, though rotate(..., false) is usually sufficient
    />
  );
};

export default TestControls;
