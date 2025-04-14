import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import { useState, useEffect } from "react";
import { Environment, Backdrop, OrbitControls } from "@react-three/drei";
import UserControls from "./UserControls";
import Slide1 from "./Slide1";
import { degToRad } from "three/src/math/MathUtils.js";

const slides = [1, 2, 3];

const ThreeApp = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setCurrentSlideIndex((prevIndex) =>
          Math.min(prevIndex + 1, slides.length - 1)
        );
      } else if (event.key === "ArrowLeft") {
        setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
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
      <Slide1 position={new Vector3(0, 0, 0)}></Slide1>
      {/* <OrbitControls /> */}
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
