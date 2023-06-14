import type { NextPage } from "next";
import ThemeChanger from "@/components/ThemeChanger";
import ProseMirrorEditor from "@/components/Editor";

const Home: NextPage = () => {
  return (
    <main>
      <div className="mx-auto flex h-[60px] w-full max-w-7xl flex-wrap items-center justify-end px-6 sm:px-8">
        <ul className="flex list-none items-center gap-4 sm:gap-6">
          <li className="block"></li>
          <li className="block">
            <ThemeChanger />
          </li>
        </ul>
      </div>
      <div className="mx-auto">
        <ProseMirrorEditor />
      </div>
    </main>
  );
};

export default Home;
