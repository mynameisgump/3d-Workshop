import * as THREE from "three";
import React, { JSX, useState, useEffect, useCallback } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";

type ActionName = "Animation";

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    r3fBottom: THREE.Mesh;
    r3fTop: THREE.Mesh;
    r3fText: THREE.Mesh;
    threejsBottom: THREE.Mesh;
    threeJsTop: THREE.Mesh;
    threejsText: THREE.Mesh;
    webGLDoll: THREE.Mesh;
    webGLText: THREE.Mesh;
  };
  materials: {
    bolshaya: THREE.MeshStandardMaterial;
    r3fBlack: THREE.MeshStandardMaterial;
    matryoshka2: THREE.MeshStandardMaterial;
    matryoshka3: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export function Dolls(props: JSX.IntrinsicElements["group"]) {
  const group = React.useRef<THREE.Group>();
  const r3fDoll = React.useRef<THREE.Mesh>(null);
  const { nodes, materials, animations } = useGLTF("/Dolls.glb") as GLTFResult;
  const { actions, mixer } = useAnimations(animations, group);
  const stacked = React.useRef(true);
  const [selectedDoll, setSelectedDoll] = useState<string>("none");
  console.log(selectedDoll);
  useEffect(() => {
    mixer.addEventListener("finished", (e) => {
      console.log("Finished", e);
      stacked.current = false;
    });
  }, [mixer]);

  const playUnstack = () => {
    if (!actions.Animation) return;
    actions.Animation.clampWhenFinished = true;
    actions.Animation.setLoop(THREE.LoopOnce, 1);
    actions.Animation.play();
  };
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Sway left/right like bending knees
    // const sway = Math.sin(t * 2) * 0.3; // rotation
  });
  const handleDollClick = useCallback((name: string) => {
    if (name === "r3f") {
      setSelectedDoll("r3f");
    }
    if (name === "threejs") {
      setSelectedDoll("threejs");
    }
    if (name === "webGL") {
      setSelectedDoll("webGL");
    }
  }, []);

  return (
    <group onClick={playUnstack} ref={group} {...props} dispose={null}>
      <group name="Scene">
        <mesh
          name="r3fBottom"
          geometry={nodes.r3fBottom.geometry}
          material={materials.bolshaya}
          position={[0, 1.276, 0.607]}
          rotation={[0, 1.571, 0]}
          scale={0.094}
          ref={r3fDoll}
          castShadow
          onClick={() => handleDollClick("r3f")}
        >
          <mesh
            name="r3fTop"
            geometry={nodes.r3fTop.geometry}
            material={materials.bolshaya}
            position={[-3.253, -5.025, 0]}
            castShadow
            onClick={() => handleDollClick("r3f")}
          >
            <mesh
              name="r3fText"
              geometry={nodes.r3fText.geometry}
              material={materials.r3fBlack}
              position={[9.559, 27.904, -0.01]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={10.648}
              castShadow
              onClick={() => handleDollClick("r3f")}
            />
          </mesh>
        </mesh>
        <mesh
          name="threejsBottom"
          geometry={nodes.threejsBottom.geometry}
          material={materials.matryoshka2}
          position={[0, 1.06, 0.511]}
          rotation={[0.008, 1.571, 0]}
          scale={0.074}
          castShadow
          onClick={() => handleDollClick("threejs")}
        >
          <mesh
            name="threeJsTop"
            geometry={nodes.threeJsTop.geometry}
            material={materials.matryoshka2}
            position={[-3.258, -5.08, 0]}
            castShadow
            onClick={() => handleDollClick("threejs")}
          >
            <mesh
              name="threejsText"
              geometry={nodes.threejsText.geometry}
              material={nodes.threejsText.material}
              position={[10.253, 27.284, 0]}
              rotation={[Math.PI / 2, -0.008, 0]}
              scale={3.891}
              castShadow
              onClick={() => handleDollClick("threejs")}
            />
          </mesh>
        </mesh>
        <mesh
          name="webGLDoll"
          geometry={nodes.webGLDoll.geometry}
          material={materials.matryoshka3}
          position={[0, 0.826, 0.381]}
          rotation={[0, 1.571, 0]}
          scale={0.055}
          castShadow
          onClick={() => handleDollClick("webGL")}
        >
          <mesh
            name="webGLText"
            geometry={nodes.webGLText.geometry}
            material={nodes.webGLText.material}
            position={[6.531, 22.671, 0.001]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={3.626}
            castShadow
            onClick={() => handleDollClick("webGL")}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/Dolls.glb");
