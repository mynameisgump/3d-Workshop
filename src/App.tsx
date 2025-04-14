import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { useState, useEffect, useMemo } from "react";
import { Environment, Backdrop, OrbitControls } from "@react-three/drei";
import UserControls from "./UserControls";
import Slide1 from "./Slide1";
import { degToRad } from "three/src/math/MathUtils.js";
import { slideShowIndex } from "./atoms/atoms";
import { useAtom } from "jotai";

// const slides = [1, 2, 3];
// const slides = [
//   (<Slide1 position={[0,0,0]}></Slide1>),
//   (<Slide1 position={[0,0,0]}></Slide1>),
// ]
const slides = ["slide1", "slide1"];

const ThreeApp = () => {
  // const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useAtom(slideShowIndex);

  const slideComponents = useMemo(() => {
    return slides.map((slide, index) => {
      const position = new Vector3(index * 10, 0, 0);
      return <Slide1 key={index} index={index} position={position} />;
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
      {slideComponents}
      <Backdrop
        floor={10}
        segments={20}
        receiveShadow={true}
        scale={[40, 10, 1]}
        position={[0, -2, -3]}
      >
        <meshStandardMaterial color="#353540" />
      </Backdrop>
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
