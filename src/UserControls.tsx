import { useState } from "react";
import { Vector3 } from "three";
import { useThree, useFrame } from "@react-three/fiber";

const UserControls = () => {
  const [vec] = useState(() => new Vector3());
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.lerp(vec.set(pointer.x * 2, 10, 30), 0.05);
  });
};

export default UserControls;
