import { useEffect, useState } from "react";

const WIDTH_THRESHOLD = 800;

export function useIsNarrowView() {
  const [isBelowThreshold, setIsBelowThreshold] = useState(
    window.innerWidth < WIDTH_THRESHOLD
  );

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsBelowThreshold(width < WIDTH_THRESHOLD);
    }
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isBelowThreshold;
}
