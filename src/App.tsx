import { Canvas } from "@react-three/fiber";
import { Environment, Backdrop } from "@react-three/drei";
import UserControls from "./UserControls";
import Slide1 from "./Slide1";

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 10, 30], fov: 15 }}>
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight
        position={[0, 10, 0]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* <pointLight position={[-10, -10, -10]} decay={0} intensity={99999} /> */}
      <Environment preset="city" />
      {/* <OrbitControls /> */}
      <Slide1></Slide1>
      {/* <OrbitControls /> */}
      <Backdrop
        floor={10} // Stretches the floor segment, 0.25 by default
        segments={20} // Mesh-resolution, 20 by default
        receiveShadow={true}
        scale={[40, 10, 1]}
        position={[0, -2, -3]}
      >
        <meshStandardMaterial color="#353540" />
      </Backdrop>
      {/* <OrbitControls /> */}
      {/* <UserControls /> */}
    </Canvas>
  );
}

export default App;
