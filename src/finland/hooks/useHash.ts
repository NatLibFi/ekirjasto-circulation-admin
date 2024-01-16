import { useState, useEffect } from "react";

// React-router v3 is old and has rather poor support for nested routing in sub components
// so let's create a quick hash-based navigation system until it is updated in the upstream
export function useHash(fallback?: string) {
  const [currentHash, setCurrentHash] = useState(
    fallback
      ? window.location.hash.replace("#", "") || fallback
      : window.location.hash.replace("#", "")
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace("#", ""));
    };

    window.addEventListener("hashchange", handleHashChange);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return currentHash;
}
