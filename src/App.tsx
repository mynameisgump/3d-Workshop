import { Canvas } from "@react-three/fiber";
import { Scene, Vector3 } from "three";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Environment,
  Backdrop,
  OrbitControls,
  CameraControls,
  Bounds,
} from "@react-three/drei";
import UserControls from "./UserControls";
import Slide1 from "./slides/Slide1";
import Slide2 from "./slides/Slide2";
import Slide3 from "./slides/Slide3";
import WebGlSlide from "./slides/WebGLSlide";
import TextSlide from "./slides/TextSlide";
import { degToRad } from "three/src/math/MathUtils.js";
import { slideShowIndex } from "./atoms/atoms";
import { useAtom } from "jotai";
import DollsSlide from "./slides/DollsSlide";
import TestControls from "./TestControls";
import ThreeJsSlide from "./slides/ThreeJsSlide";
import Lights from "./Lights";
import SceneSlide from "./slides/SceneSlide";
import MeshSlide from "./slides/MeshSlide";
import LightsSlide from "./slides/LightsSlide";
import CameraSlide from "./slides/CameraSlide";
import TutorialSlide from "./slides/TutorialSlide";

const slides = [
  "slide1",
  "slide2",
  "Dolls",
  "SceneSlide",
  "MeshSlide",
  "LightsSlide",
  "Cameras",
  "Tutorial",
  // "Shaders???",
  // "VR and AR???",
];

const ThreeApp = () => {
  const [slideIndex, setSlideIndex] = useAtom(slideShowIndex);

  const slideComponents = useMemo(() => {
    return slides.map((slide, index) => {
      const initialPosition = new Vector3(index * 10, 0, 0);
      if (slide == "slide1") {
        return <Slide1 key={index} index={index} position={initialPosition} />;
      }
      if (slide == "slide2") {
        return <Slide2 key={index} index={index} position={initialPosition} />;
      }
      if (slide == "Dolls") {
        return (
          <DollsSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "WebGlSlide") {
        return (
          <WebGlSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "ThreeJS") {
        return (
          <ThreeJsSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "SceneSlide") {
        return (
          <SceneSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "MeshSlide") {
        return (
          <MeshSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "LightsSlide") {
        return (
          <LightsSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "Cameras") {
        return (
          <CameraSlide key={index} index={index} position={initialPosition} />
        );
      }
      if (slide == "Tutorial") {
        return (
          <TutorialSlide key={index} index={index} position={initialPosition} />
        );
      } else {
        return (
          <TextSlide
            key={index}
            index={index}
            position={initialPosition}
            text={slide}
          />
        );
      }
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSlideIndex((prevIndex) =>
          Math.min(prevIndex + 1, slides.length - 1)
        );
      } else if (event.key === "ArrowLeft") {
        setSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Lights />

      {/* <OrbitControls /> */}
      <Bounds>{slideComponents}</Bounds>
      <Backdrop
        floor={10}
        segments={20}
        receiveShadow={true}
        scale={[40, 10, 1]}
        position={[0, -2, -3]}
      >
        <meshStandardMaterial color="#353540" />
      </Backdrop>
      <UserControls></UserControls>
    </>
  );
};

function App() {
  return (
    <Canvas shadows>
      <ThreeApp />
    </Canvas>
  );
}

export default App;
