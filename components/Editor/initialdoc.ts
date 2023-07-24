/* You can initialize an editor's state:
   - from the schema:
       e.g. `EditorState.create({ schema, plugins })`
   - from JSON:
       e.g. `EditorState.create({ doc: Node.fromJSON(schema, initialDoc), plugins })`
       (where `initialDoc` is a json representation of a prosemirror node)
   - from HTML:
       e.g. `EditorState.create({ doc: DOMParser.fromSchema(schema).parse(
               document.querySelector("#content") as HTMLElement, {
                 preserveWhitespace: true,
               }
             ), plugins })`
       (where an element with the id `content` contains the html to be parsed) */
export const initialDocJSON = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a text editor built with ProseMirror." },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          marks: [{ type: "strong" }],
          text: "Press CMD + A then BACKSPACE to start from a blank document.",
        },
      ],
    },
    {
      type: "paragraph",
    },
  ],
};
