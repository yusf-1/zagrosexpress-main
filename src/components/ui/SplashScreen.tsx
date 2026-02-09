import { useEffect } from "react";
import loadingDots from "@/assets/loading-dots.gif";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <img src={loadingDots} alt="Loading..." className="w-20 h-20" />
    </div>
  );
};

export default SplashScreen;