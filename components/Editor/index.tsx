"use client";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "./schema";
import { plugins } from "./plugins";
import { useCallback, useEffect } from "react";

const ProseMirrorEditor = () => {
  const EDITOR_ELEMENT_ID = "editor";
  const CONTENT_ELEMENT_ID = "content";

  const setEditorPadding = () => {
    const editorMaxWidth = 672;
    const editorMinPadding = 48;

    if (typeof window !== "undefined") {
      const availablePadding = window.innerWidth - editorMaxWidth;

      const editorPadding =
        availablePadding > editorMinPadding
          ? availablePadding
          : editorMinPadding;

      const editorElement = document.querySelector(
        ".ProseMirror"
      ) as HTMLDivElement;

      if (editorElement) {
        editorElement.style.paddingLeft = `${Math.round(editorPadding / 2)}px`;
        editorElement.style.paddingRight = `${Math.round(editorPadding / 2)}px`;
      }
    }
  };

  // https://stackoverflow.com/a/72619287 : listen to children length changes
  const setEditorRef = useCallback((ref: HTMLDivElement) => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          // set editor padding as soon as the ".ProseMirror" element loads
          setEditorPadding();
          // focus the editor as soon as it loads
          (document.querySelector(".ProseMirror") as HTMLDivElement)?.focus();
        }
      }
    });

    observer.observe(ref, { childList: true });
  }, []);

  useEffect(() => {
    const editorElement = document?.getElementById(EDITOR_ELEMENT_ID);
    // const contentElement = document?.getElementById(CONTENT_ELEMENT_ID);

    window.addEventListener("resize", setEditorPadding);

    if (
      editorElement?.children.length === 0 // prevents contenteditable duplication
    ) {
      /* generate an empty doc conforming to the schema & a default selection at the doc's start */
      /* plugins are registered when creating a state (b/c they get access to state transactions) */
      const state = EditorState.create({
        schema,
        plugins,
      });

      /* create a view for the state and append to `editorElement` */
      new EditorView(editorElement, { state });
    }

    return () => {
      window.removeEventListener("resize", setEditorPadding);
    };
  }, []);

  return (
    <div className="focus:outline-none">
      <div ref={setEditorRef} id={EDITOR_ELEMENT_ID}></div>
      <div id={CONTENT_ELEMENT_ID}></div>
    </div>
  );
};

export default ProseMirrorEditor;
