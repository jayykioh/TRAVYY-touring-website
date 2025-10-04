import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import paperplane from "../assets/paperplane-loading.json";

export default function LoadingScreen({ minDuration = 1500 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  if (!visible) return null; 

  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-white animate-fade-in"
      role="status"
      aria-label="Loading"
    >
      <Lottie
        animationData={paperplane}
        loop
        style={{ width: 200, height: 200 }}
      />
      <style>{`
        @keyframes fade-in { from {opacity:0} to {opacity:1} }
        .animate-fade-in { animation: fade-in .4s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
