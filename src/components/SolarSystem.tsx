import React, { useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { degToRad } from "three/src/math/MathUtils.js";

type PlanetConfig = {
  radius: number; // Planet visual radius
  distance: number; // Distance from sun
  speed: number; // Orbit speed
  color: string;
};

const planets: PlanetConfig[] = [
  { radius: 0.3, distance: 3, speed: 0.5, color: "#aaffaa" },
  { radius: 0.5, distance: 5, speed: 0.56, color: "#aaaaff" },
  { radius: 0.4, distance: 7, speed: 0.45, color: "#ffaaaa" },
];

type SolarSystemProps = {
  position?: [number, number, number];
};
export const SolarSystem = ({ position }: SolarSystemProps) => {
  const groupRef = useRef<Group>(null!);
  const outerGroupRef = useRef<Group>(null!);
  const planetRefs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    planetRefs.current.forEach((planet, index) => {
      const { distance, speed } = planets[index];
      const angle = elapsed * speed * 2 * Math.PI;
      if (planet) {
        planet.position.set(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        );
      }
    });
    // groupRef.current.rotation.y += 0.01; // Rotate the whole solar system
    outerGroupRef.current.rotation.y += 0.01; // Rotate the whole solar system
  });

  return (
    <group ref={outerGroupRef} position={position}>
      <group
        scale={[0.3, 0.3, 0.3]}
        rotation={[degToRad(45), 0, 0]}
        ref={groupRef}
      >
        {/* Sun */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial emissive={"#ffffaa"} color={"#ffaa00"} />
          <pointLight intensity={100}></pointLight>
        </mesh>

        {/* Planets */}
        {planets.map((planet, idx) => (
          <mesh
            key={idx}
            ref={(el) => (planetRefs.current[idx] = el)}
            position={[planet.distance, 0, 0]}
          >
            <sphereGeometry args={[planet.radius, 16, 16]} />
            <meshStandardMaterial color={planet.color} />
          </mesh>
        ))}

        {/* Orbit rings */}
        {planets.map((planet, idx) => (
          <mesh key={`orbit-${idx}`} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[planet.distance - 0.09, planet.distance + 0.07, 64]}
            />
            <meshBasicMaterial
              color="#666"
              transparent
              opacity={0.5}
              side={2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
export default SolarSystem;
