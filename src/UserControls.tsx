import {
  useRef,
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useLayoutEffect,
} from "react";
import { useFrame, useThree, ReactThreeFiber } from "@react-three/fiber";
import CameraControlsImpl from "camera-controls";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "@react-three/drei";
import { useAtom } from "jotai";
import { currentCamera } from "./atoms/atoms";

// --- Constants ---
const TRANSITION_DURATION_S = 1.0; // Duration in seconds for GSAP
const FLY_BACK_DISTANCE = -900; // How far to move back for ortho transition
const MOUSE_SENSITIVITY_X = 0.1; // Sensitivity for perspective mouse look
const MOUSE_SENSITIVITY_Y = 0.08; // Sensitivity for perspective mouse look
const LERP_FACTOR = 0.1; // Smoothing for perspective mouse look

// Initial Camera States (Perspective settings are primary)
const INITIAL_PERSPECTIVE_POSITION: THREE.Vector3Tuple = [0, 1, 8];
const INITIAL_PERSPECTIVE_TARGET: THREE.Vector3Tuple = [0, 0, 0];
// Ortho position is now dynamic, but zoom is fixed
const INITIAL_ORTHO_ZOOM = 50; // Adjust for desired ortho view scale after flying back

// Camera Settings
const PERSPECTIVE_FOV = 50;
const PERSPECTIVE_NEAR = 0.1;
const PERSPECTIVE_FAR = 1000;
const ORTHO_NEAR = 0.001;
const ORTHO_FAR = 10000;

// Install CameraControls THREE subset
const subsetOfTHREE = {
  MOUSE: THREE.MOUSE,
  Vector2: THREE.Vector2,
  Vector3: THREE.Vector3,
  Vector4: THREE.Vector4,
  Quaternion: THREE.Quaternion,
  Matrix4: THREE.Matrix4,
  Spherical: THREE.Spherical,
  Box3: THREE.Box3,
  Sphere: THREE.Sphere,
  Raycaster: THREE.Raycaster,
  MathUtils: {
    DEG2RAD: THREE.MathUtils.DEG2RAD,
    clamp: THREE.MathUtils.clamp,
  },
};
CameraControlsImpl.install({ THREE: subsetOfTHREE });

const clock = new THREE.Clock();

// Helper vectors/matrices for saving state and calculations
const tempPos = new THREE.Vector3();
const tempTarget = new THREE.Vector3();
const forwardDirection = new THREE.Vector3(); // To calculate fly-back direction
const targetOrthoPosition = new THREE.Vector3(); // To calculate dynamic ortho position

// Saved states for switching back
let savedPersPos: THREE.Vector3Tuple = [...INITIAL_PERSPECTIVE_POSITION];
let savedPersTarget: THREE.Vector3Tuple = [...INITIAL_PERSPECTIVE_TARGET];
// Ortho state is now more dynamic, store the last calculated position/target
let savedOrthoPos: THREE.Vector3Tuple | null = null; // Initially null, calculated on first switch
let savedOrthoTarget: THREE.Vector3Tuple | null = null; // Initially null, calculated on first switch
let savedOrthoZoom: number = INITIAL_ORTHO_ZOOM;

// Temporary storage for matrix interpolation
const startMatrix = new THREE.Matrix4();
const endMatrix = new THREE.Matrix4();
const interpolatedMatrix = new THREE.Matrix4();

interface SmoothViewSwitcherProps
  extends Omit<ReactThreeFiber.ComponentProps<"primitive">, "object"> {
  initialMode?: "perspective" | "orthographic";
}

const SmoothViewSwitcher = forwardRef<
  CameraControlsImpl,
  SmoothViewSwitcherProps
>(({ initialMode = "perspective", ...restProps }, ref) => {
  const controlsRef = useRef<CameraControlsImpl>(null!);
  const gsapTweenRef = useRef<gsap.core.Tween | null>(null);
  // const [mode, setMode] = useState<"perspective" | "orthographic">(initialMode);
  const [mode, setMode] = useAtom(currentCamera);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for perspective mouse look
  const mousePositionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const targetMouseRotationRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const currentMouseRotationRef = useRef<THREE.Vector2>(
    new THREE.Vector2(0, 0)
  );
  // Store the base rotation established by camera-controls after transition
  const baseRotationEuler = useRef<THREE.Euler>(
    new THREE.Euler(0, 0, 0, "YXZ")
  );

  const { gl, size, invalidate, set, camera: defaultCamera } = useThree();

  // --- Internal Cameras ---
  const [persCam, orthoCam] = useMemo(() => {
    const pCam = new THREE.PerspectiveCamera(
      PERSPECTIVE_FOV,
      size.width / size.height,
      PERSPECTIVE_NEAR,
      PERSPECTIVE_FAR
    );
    const oCam = new THREE.OrthographicCamera(
      size.width / -2,
      size.width / 2,
      size.height / 2,
      size.height / -2,
      ORTHO_NEAR,
      ORTHO_FAR
    );
    oCam.zoom = INITIAL_ORTHO_ZOOM; // Use initial zoom
    savedOrthoZoom = INITIAL_ORTHO_ZOOM;

    pCam.position.set(...INITIAL_PERSPECTIVE_POSITION);
    // Ortho position will be set dynamically during the first transition if starting in perspective
    // If starting in ortho, we need an initial position calculation
    if (initialMode === "orthographic") {
      // Calculate a default "fly back" position assuming starting at perspective origin
      const startPos = new THREE.Vector3(...INITIAL_PERSPECTIVE_POSITION);
      const startTarget = new THREE.Vector3(...INITIAL_PERSPECTIVE_TARGET);
      forwardDirection.subVectors(startTarget, startPos).normalize(); // Look direction approx
      targetOrthoPosition
        .copy(startPos)
        .addScaledVector(forwardDirection, -FLY_BACK_DISTANCE);
      oCam.position.copy(targetOrthoPosition);
      savedOrthoPos = targetOrthoPosition.toArray();
      savedOrthoTarget = [...INITIAL_PERSPECTIVE_TARGET]; // Look at the same initial target
    }

    // Set initial base rotation from position/target
    const initialTargetVec = new THREE.Vector3(...INITIAL_PERSPECTIVE_TARGET);
    pCam.lookAt(initialTargetVec);
    baseRotationEuler.current.setFromQuaternion(pCam.quaternion, "YXZ");

    console.log("Cameras created");
    return [pCam, oCam];
  }, []); // Create cameras only once

  // --- Camera Controls Instance ---
  useMemo(() => {
    const currentCam = mode === "perspective" ? persCam : orthoCam;
    const controls = new CameraControlsImpl(currentCam, gl.domElement);

    const initialPos =
      mode === "perspective"
        ? savedPersPos
        : savedOrthoPos || INITIAL_PERSPECTIVE_POSITION; // Use saved or default
    const initialTarget =
      mode === "perspective"
        ? savedPersTarget
        : savedOrthoTarget || INITIAL_PERSPECTIVE_TARGET;
    const initialCamPos =
      mode === "perspective" ? persCam.position : orthoCam.position;

    controls.setLookAt(
      initialPos[0],
      initialPos[1],
      initialPos[2],
      initialTarget[0],
      initialTarget[1],
      initialTarget[2],
      false // No transition initially
    );

    // Manually set camera position if starting in ortho mode with calculated pos
    if (mode === "orthographic" && savedOrthoPos) {
      currentCam.position.set(...savedOrthoPos);
    }
    currentCam.zoom = mode === "orthographic" ? savedOrthoZoom : 1;
    currentCam.updateProjectionMatrix();

    // Configure controls: disable interaction for perspective mode initially
    controls.enabled = mode === "orthographic";

    controlsRef.current = controls;
    console.log(
      "Controls created for mode:",
      mode,
      "Controls enabled:",
      controls.enabled
    );
    set({ camera: currentCam });
    return controls;
  }, [gl.domElement, persCam, orthoCam]); // Rerun if these change (should be rare)

  // --- Sync Cameras with Viewport Size ---
  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    persCam.aspect = aspect;
    persCam.updateProjectionMatrix();

    orthoCam.left = size.width / -2;
    orthoCam.right = size.width / 2;
    orthoCam.top = size.height / 2;
    orthoCam.bottom = size.height / -2;
    orthoCam.updateProjectionMatrix();
    console.log("Viewport sync:", size);

    // Update controls boundaries if needed (optional)
    // controlsRef.current?.setBoundary(new THREE.Box3( ... ));
  }, [size, persCam, orthoCam]);

  // --- Perspective Mouse Look Listener ---
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Only update if in perspective, not transitioning, and controls are disabled (meaning manual look is active)
      if (
        mode === "perspective" &&
        !isTransitioning &&
        !controlsRef.current?.enabled
      ) {
        mousePositionRef.current.x =
          (event.clientX / window.innerWidth) * 2 - 1;
        mousePositionRef.current.y =
          -(event.clientY / window.innerHeight) * 2 + 1; // Invert Y
      } else {
        // Reset target rotation smoothly when mouse look is inactive
        mousePositionRef.current.set(0, 0);
        targetMouseRotationRef.current.set(0, 0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mode, isTransitioning]); // Re-run when mode or transition state changes

  // --- Handle Mode Change Trigger ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !isTransitioning) {
        setMode((prevMode) =>
          prevMode === "perspective" ? "orthographic" : "perspective"
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTransitioning]);

  // --- Perform Transition when Mode Changes ---
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const targetMode = mode;
    const currentCam = controls.camera;
    const currentMode: "perspective" | "orthographic" = (
      currentCam as THREE.PerspectiveCamera
    ).isPerspectiveCamera
      ? "perspective"
      : "orthographic";

    if (targetMode === currentMode || isTransitioning) {
      console.log(
        `Transition skipped: targetMode=${targetMode}, currentMode=${currentMode}, isTransitioning=${isTransitioning}`
      );
      // Ensure controls enabled state matches mode if no transition needed
      if (!isTransitioning) {
        controls.enabled = targetMode === "orthographic";
        if (targetMode === "perspective") {
          // Reset mouse look refs if switching back without animation (unlikely but safe)
          targetMouseRotationRef.current.set(0, 0);
          currentMouseRotationRef.current.set(0, 0);
        }
      }
      return;
    }

    // --- Start Transition ---
    setIsTransitioning(true);
    controls.enabled = false; // Disable ALL controls during transition
    gsapTweenRef.current?.kill();
    console.log(`Starting transition from ${currentMode} to ${targetMode}`);

    // --- Variables for target state ---
    let targetPosArray: THREE.Vector3Tuple;
    let targetTargetArray: THREE.Vector3Tuple;
    let targetZoom: number;
    const targetCam = targetMode === "perspective" ? persCam : orthoCam;

    // 1. Determine Target State & Save Current State
    controls.getPosition(tempPos);
    controls.getTarget(tempTarget);
    const currentPosArray = tempPos.toArray();
    const currentTargetArray = tempTarget.toArray();

    if (targetMode === "orthographic") {
      // Switching Perspective -> Orthographic
      console.log("Switching Persp -> Ortho");
      // Save current perspective state
      savedPersPos = currentPosArray;
      savedPersTarget = currentTargetArray;

      // Calculate fly-back position
      currentCam.getWorldDirection(forwardDirection); // Get camera's current look direction
      targetOrthoPosition
        .copy(tempPos)
        .addScaledVector(forwardDirection, -FLY_BACK_DISTANCE);

      // Set target state for ortho
      targetPosArray = targetOrthoPosition.toArray();
      targetTargetArray = currentTargetArray; // Look at the same point we were looking at
      targetZoom = INITIAL_ORTHO_ZOOM; // Use the fixed initial zoom

      // Save calculated ortho state for potential switch back later
      savedOrthoPos = targetPosArray;
      savedOrthoTarget = targetTargetArray;
      savedOrthoZoom = targetZoom; // Store the zoom used

      console.log("Saved Persp State:", savedPersPos, savedPersTarget);
      console.log(
        "Calculated Ortho Target State:",
        targetPosArray,
        targetTargetArray,
        targetZoom
      );
    } else {
      // Switching Orthographic -> Perspective
      console.log("Switching Ortho -> Persp");
      // Save current orthographic state (might be useful later, though position is dynamic)
      savedOrthoPos = currentPosArray;
      savedOrthoTarget = currentTargetArray;
      savedOrthoZoom = (currentCam as THREE.OrthographicCamera).zoom;

      // Set target state using previously saved perspective state
      targetPosArray = savedPersPos;
      targetTargetArray = savedPersTarget;
      targetZoom = 1; // Perspective uses dolly (zoom=1)

      console.log(
        "Saved Ortho State:",
        savedOrthoPos,
        savedOrthoTarget,
        savedOrthoZoom
      );
      console.log(
        "Using Saved Persp Target State:",
        targetPosArray,
        targetTargetArray
      );
    }

    // Ensure target camera's projection matrix is correct
    targetCam.updateProjectionMatrix();
    startMatrix.copy(currentCam.projectionMatrix);
    endMatrix.copy(targetCam.projectionMatrix);

    // 2. Animate Projection Matrix using GSAP
    const progress = { value: 0 };
    gsapTweenRef.current = gsap.to(progress, {
      value: 1,
      duration: TRANSITION_DURATION_S,
      ease: "power2.inOut",
      onUpdate: () => {
        for (let i = 0; i < 16; i++) {
          interpolatedMatrix.elements[i] = THREE.MathUtils.lerp(
            startMatrix.elements[i],
            endMatrix.elements[i],
            progress.value
          );
        }
        controls.camera.projectionMatrix.copy(interpolatedMatrix);
        controls.camera.projectionMatrixInverse
          .copy(controls.camera.projectionMatrix)
          .invert();
        invalidate();
      },
      onComplete: () => {
        console.log("Matrix animation complete (GSAP)");
        controls.camera.projectionMatrix.copy(endMatrix); // Ensure final state
        controls.camera.projectionMatrixInverse.copy(endMatrix).invert();
        currentCam.updateProjectionMatrix(); // Reset old cam's matrix

        // Switch the controls and R3F over to the *target* camera
        set({ camera: targetCam });
        controls.camera = targetCam;

        // Restore zoom AFTER switching camera
        controls.zoomTo(targetZoom, false);

        gsapTweenRef.current = null;
        invalidate(); // Render final matrix state

        // If target is perspective, capture the base rotation AFTER matrix switch & zoomTo
        if (targetMode === "perspective") {
          baseRotationEuler.current.setFromQuaternion(
            controls.camera.quaternion,
            "YXZ"
          );
          console.log(
            "Captured base rotation for perspective:",
            baseRotationEuler.current
          );
        }
      },
      onError: (err) => {
        /* ... error handling ... */
        console.error("GSAP Matrix animation error:", err);
        // Fallback: Snap to target state
        currentCam.updateProjectionMatrix(); // Reset old cam
        set({ camera: targetCam });
        controls.camera = targetCam;
        controls.zoomTo(targetZoom, false);
        // controls.enabled = targetMode === 'orthographic'; // Set final enabled state
        setIsTransitioning(false); // Ensure transition state is reset on error
        gsapTweenRef.current = null;
        invalidate();
      },
    });

    // 3. Animate Position and Target using controls' internal smoothing
    controls
      .setLookAt(
        targetPosArray[0],
        targetPosArray[1],
        targetPosArray[2],
        targetTargetArray[0],
        targetTargetArray[1],
        targetTargetArray[2],
        true // Enable smooth transition
      )
      .then(() => {
        console.log("Position transition complete");
        // Only fully end transition after both matrix and position are done
        if (gsapTweenRef.current === null) {
          setIsTransitioning(false);
          // IMPORTANT: Set final enabled state for controls based on target mode
          controls.enabled = targetMode === "orthographic";
          console.log(
            "Transition finished. Controls enabled:",
            controls.enabled
          );

          // Reset mouse look refs if we ended in perspective
          if (targetMode === "perspective") {
            targetMouseRotationRef.current.set(0, 0);
            currentMouseRotationRef.current.set(0, 0);
            // Capture final rotation from controls after setLookAt as the base for mouse look
            baseRotationEuler.current.setFromQuaternion(
              controls.camera.quaternion,
              "YXZ"
            );
            console.log(
              "Recaptured base rotation after setLookAt:",
              baseRotationEuler.current
            );
          }
          invalidate();
        } else {
          // If GSAP is lagging, attach completion logic there
          gsapTweenRef.current?.eventCallback("onComplete", () => {
            // Existing GSAP onComplete runs first...
            setIsTransitioning(false);
            controls.enabled = targetMode === "orthographic";
            console.log(
              "Transition finished (GSAP completed late). Controls enabled:",
              controls.enabled
            );
            if (targetMode === "perspective") {
              targetMouseRotationRef.current.set(0, 0);
              currentMouseRotationRef.current.set(0, 0);
              baseRotationEuler.current.setFromQuaternion(
                controls.camera.quaternion,
                "YXZ"
              );
              console.log(
                "Recaptured base rotation after setLookAt/late GSAP:",
                baseRotationEuler.current
              );
            }
            invalidate();
          });
        }
      })
      .catch((err) => {
        /* ... error handling ... */
        console.error("setLookAt transition error:", err);
        gsapTweenRef.current?.kill(); // Kill GSAP tween
        gsapTweenRef.current = null;
        // Fallback: Snap position/target
        controls.setLookAt(
          targetPosArray[0],
          targetPosArray[1],
          targetPosArray[2],
          targetTargetArray[0],
          targetTargetArray[1],
          targetTargetArray[2],
          false
        );
        setIsTransitioning(false);
        controls.enabled = targetMode === "orthographic"; // Set final enabled state
        invalidate();
      });
  }, [mode]); // React only to mode changes

  // --- Frame Loop for Camera Controls Update & Manual Look ---
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Process perspective mouse look if active
    if (mode === "perspective" && !isTransitioning && !controls.enabled) {
      // Lerp towards target rotation
      targetMouseRotationRef.current.x =
        -mousePositionRef.current.x * MOUSE_SENSITIVITY_X;
      targetMouseRotationRef.current.y =
        mousePositionRef.current.y * MOUSE_SENSITIVITY_Y;
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
      // IMPORTANT: Operate directly on the controls' camera object
      console.log();
      controls.camera.rotation.copy(baseRotationEuler.current); // Start with base rotation
      controls.camera.rotateY(currentMouseRotationRef.current.x); // Yaw
      controls.camera.rotateX(currentMouseRotationRef.current.y); // Pitch

      // Clamp pitch rotation if desired
      // const maxPitch = Math.PI / 2 - 0.1;
      // controls.camera.rotation.x = THREE.MathUtils.clamp(controls.camera.rotation.x, -maxPitch, maxPitch);

      invalidate(); // Need to render the manual rotation
    }

    // Update camera-controls if it's enabled and not being overridden by GSAP matrix tween
    // Note: controls.update also handles smooth transition for setLookAt
    if (controls.enabled && !gsapTweenRef.current) {
      // Update if enabled OR if internal transition (like setLookAt) is running
      const needsUpdate = controls.update(delta);
      if (needsUpdate) {
        invalidate();
      }
    }
  });

  // --- Cleanup ---
  useEffect(() => {
    const controls = controlsRef.current;
    return () => {
      console.log("Cleaning up controls and GSAP tween");
      gsapTweenRef.current?.kill();
      controls?.dispose();
    };
  }, []);

  return (
    <>
      <primitive ref={ref} object={controlsRef.current} {...restProps} />
      {/* Cameras managed internally */}
      <OrbitControls></OrbitControls>
    </>
  );
});

export default SmoothViewSwitcher;
