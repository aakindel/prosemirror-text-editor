"use client";

import { useState, useEffect } from "react";

function useHasWindow(): boolean {
  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    setHasWindow(true);
  }, [hasWindow]);

  return hasWindow;
}

export default useHasWindow;
