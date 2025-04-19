import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
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

const slides = [
  "slide1",
  "slide2",
  "Dolls",
  "WebGlSlide",
  "Structure of a Scene",
  "Meshes",
  "Materials",
  "Lights",
  "Cameras",
  "Your first Scene",
  "Shaders",
  "VR and AR",
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
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight
        position={[0, 10, 0]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Environment preset="city" />
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
      {/* <CameraControls></CameraControls> */}
      {/* <TestControls></TestControls> */}
    </>
  );
};

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 5] }}>
      <ThreeApp />
    </Canvas>
  );
}

export default App;
