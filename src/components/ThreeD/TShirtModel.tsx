"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Mesh } from "three";
import { useDesignStore } from "@/store/designStore";

export default function TShirtModel() {
  const meshRef = useRef<Mesh>(null);
  const { selectedDesign } = useDesignStore();

  useEffect(() => {
    console.log("👕 TShirtModel mounted");
    console.log("🎨 Selected design:", selectedDesign);
    console.log("📦 Mesh ref:", meshRef.current);
  }, [selectedDesign]);

  // Animasi sederhana
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      // Log setiap 60 frames (sekitar 1 detik)
      if (state.clock.elapsedTime % 1 < 0.016) {
        console.log(
          "🔄 Animation frame running, rotation:",
          meshRef.current.rotation.y
        );
      }
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      console.log("✅ Mesh is ready:", {
        position: meshRef.current.position,
        scale: meshRef.current.scale,
        visible: meshRef.current.visible,
      });
    }
  }, [meshRef.current]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={2}>
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial
        color={selectedDesign?.color || "#ff6b6b"}
        transparent={false}
        opacity={1}
      />
    </mesh>
  );
}
