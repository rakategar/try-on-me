"use client";

import { useEffect } from "react";

export default function Lighting() {
  useEffect(() => {
    console.log("💡 Lighting component mounted");
  }, []);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      <hemisphereLight intensity={0.5} />
    </>
  );
}

// export default function Lighting() {
//   return (
//     <>
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[10, 10, 5]} intensity={1} />
//       <pointLight position={[-10, -10, -5]} intensity={0.5} />
//     </>
//   );
// }
