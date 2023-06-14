"use client";

import React from "react";
import { useTheme } from "next-themes";
import useHasWindow from "@/hooks/useHasWindow";
import { Button } from "../Button";
import { Icons } from "../Icons";

const ThemeChanger = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const hasWindow = useHasWindow();

  const changeTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return hasWindow ? (
    <React.Fragment>
      {resolvedTheme === "light" ? (
        <Button
          variant="ghost"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center p-[6px] transition-none"
          onClick={changeTheme}
        >
          <Icons.sun />
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center p-[6px] transition-none"
          onClick={changeTheme}
        >
          <Icons.moon />
        </Button>
      )}
    </React.Fragment>
  ) : (
    <div className="h-9 w-9 px-0"></div>
  );
};

export default ThemeChanger;
