import { Environment } from "@react-three/drei";
import { useAtom } from "jotai";
import { sceneLights } from "./atoms/atoms";
const Lights = () => {
  const [lighting] = useAtom(sceneLights);
  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight
        position={[0, 10, 0]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Environment preset="night" />
    </>
  );
};
export default Lights;
