// adapted from https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/schema.ts

/* The schema describes the kind of nodes that may occur in the doc & the way they are nested. */
/* Every schema must at least define a top-level node type (which defaults to the name "doc", 
   but you can configure that), and a "text" type for text content. */
/* Nodes that count as inline must declare this with the inline property (though for the text type, 
   which is inline by definition, you may omit this). */
import { Schema } from "prosemirror-model";

/** Document schema for the data model used by CommonMark. */
/* The content expression "block+" is equivalent to "(any element in the node group 'block')+" */
/* It is recommended to always require at least one child node in nodes that have block content 
   because browsers will completely collapse the node when it's empty, making it hard to edit. */
/* The order in which your nodes appear in an or-expression "e.g. (paragraph | blockquote)+" is 
   significant. When creating a default instance for a non-optional node, the first type in the 
   expression will be used. If that is a group, the first type in the group (determined by the 
   order in which the group's members appear in your nodes map) is used. If I switched the 
   positions of "paragraph" and "blockquote" in the example schema, you'd get a stack overflow as
   soon as the editor tried to create a block node—it'd create a "blockquote" node, whose content
   requires at least one block, so it'd try to create another "blockquote" as content, etc. */
/* If you write a node schema with an attribute that doesn't have a default value, an error will be 
   raised when you attempt to create such a node without specifying that attribute. */
/* Nodes that count as inline must declare this with the inline property (though for the text type,
   which is inline by definition, you may omit this) */
export const schema = new Schema({
  nodes: {
    /* the top-level doc node contains one or more block nodes */
    doc: {
      content: "block+",
    },

    /**
     * paragraph:
     * - contains zero or more inline nodes
     * - is in the 'block' node group
     * - is selected when <p> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <p> tag in the zero ‘hole’
     */
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      },
    },

    /**
     * blockquote:
     * - contains one or more 'block' nodes
     * - is in the 'block' node group
     * - is selected when <blockquote> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <blockquote> tag in the zero ‘hole’
     */
    blockquote: {
      content: "block+",
      group: "block",
      parseDOM: [{ tag: "blockquote" }],
      toDOM() {
        return ["blockquote", 0];
      },
    },

    /**
     * horizontal_rule:
     * - is in the 'block' node group
     * - is selected when <hr> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <hr> tag inside a <div>
     */
    horizontal_rule: {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["div", ["hr"]];
      },
    },

    /**
     * heading:
     * - has a level attribute which defaults to 1 if unspecified
     * - contains zero or more text or image nodes
     * - is in the 'block' node group
     * - is defining, so heading won't turn into p when entire text content is pasted over
     * - is selected when <h{level}> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <h{level}> tag in the zero ‘hole’
     */
    heading: {
      attrs: { level: { default: 1 } },
      content: "(text | image)*",
      group: "block",
      defining: true,
      parseDOM: [
        { tag: "h1", attrs: { level: 1 } },
        { tag: "h2", attrs: { level: 2 } },
        { tag: "h3", attrs: { level: 3 } },
        { tag: "h4", attrs: { level: 4 } },
        { tag: "h5", attrs: { level: 5 } },
        { tag: "h6", attrs: { level: 6 } },
      ],
      toDOM(node) {
        return ["h" + node.attrs.level, 0];
      },
    },

    /**
     * code_block:
     * - contains zero or more 'block' nodes
     * - is in the 'block' node group
     * - is code, so code_block contains code
     * - is defining, so code_block won't turn into p when entire text content is pasted over
     * - does not allow any marks
     * - is selected when <pre> dom elements are parsed (pasted or dragged in)
     * - fully preserves whitespace
     * - is rendered as an HTML <code> tag in the zero ‘hole’ inside a <pre> tag
     */
    code_block: {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      marks: "",
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
        },
      ],
      toDOM() {
        return ["pre", ["code", 0]];
      },
    },

    /**
     * ordered_list:
     * - has an order attribute which defaults to 1 if unspecified
     * - contains one or more 'list_item' nodes
     * - is in the 'block' node group
     * - is selected when <ol> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <ol> tag in the zero ‘hole’
     */
    ordered_list: {
      attrs: { order: { default: 1 } },
      content: "list_item+",
      group: "block",
      parseDOM: [
        {
          tag: "ol",
          getAttrs(dom) {
            return {
              order: (dom as HTMLElement).hasAttribute("start")
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  +(dom as HTMLElement).getAttribute("start")!
                : 1,
            };
          },
        },
      ],
      toDOM(node) {
        return [
          "ol",
          {
            start: node.attrs.order == 1 ? null : node.attrs.order,
          },
          0,
        ];
      },
    },

    /**
     * bullet_list:
     * - contains one or more 'list_item' nodes
     * - is in the 'block' node group
     * - is selected when <ul> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <ul> tag in the zero ‘hole’
     */
    bullet_list: {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM() {
        return ["ul", 0];
      },
    },

    /**
     * list_item:
     * - contains first a paragraph node, then zero or more 'block' nodes
     * - is defining, so list_item won't turn into p when entire text content is pasted over
     * - is selected when <li> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <li> tag in the zero ‘hole’
     */
    list_item: {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      },
    },

    /**
     * text:
     * - is in the 'inline' node group
     * - is inline by definition, so the `inline: true` property can be omitted
     */
    text: {
      group: "inline",
    },

    /**
     * image:
     * - is inline, so is an inline node
     * - attrs:
     *   - src: no default value, so error will be raised if unspecified on node creation
     *   - alt: defaults to null if unspecified
     *   - title: defaults to null if unspecified
     * - is in the 'inline' node group
     * - is selected when <img[src]> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <img> tag in the zero ‘hole’
     */
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null },
      },
      group: "inline",
      parseDOM: [
        {
          tag: "img[src]",
          getAttrs(dom) {
            return {
              src: (dom as HTMLElement).getAttribute("src"),
              title: (dom as HTMLElement).getAttribute("title"),
              alt: (dom as HTMLElement).getAttribute("alt"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["img", node.attrs];
      },
    },

    /**
     * hard_break:
     * - is inline, so is an inline node
     * - is in the 'inline' node group
     * - is not selectable, so cannot be selected as a node selection
     * - is selected when <br> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <br> tag in the zero ‘hole’
     */
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      },
    },
  },

  /* Marks are used to add extra styling or other information to inline content. A schema must 
     declare all mark types it allows in its schema. By default, nodes with inline content allow 
     all schema-defined marks to be applied to their children. You can configure this with the 
     marks prop on your node spec ({..., marks: "_"} = all marks) ({..., marks: ""} = no marks). */
  marks: {
    /**
     * em:
     * - is selected when <i> tag, <em> tag, or italic font style
     *   dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <em> tag
     */
    em: {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style", getAttrs: (value) => value == "italic" && null },
      ],
      toDOM() {
        return ["em"];
      },
    },

    /**
     * strong:
     * - is selected when <b> tag, <strong> tag, or bold(er) font weight
     *   dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <strong> tag
     */
    strong: {
      parseDOM: [
        { tag: "b" },
        { tag: "strong" },
        {
          style: "font-weight",
          getAttrs: (value) =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
        },
      ],
      toDOM() {
        return ["strong"];
      },
    },

    /**
     * underline:
     * - is selected when <u> tag, <ins> tag, or underline text decoration
     *   dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <span> tag with a 'prosemirror-underline' class
     */
    underline: {
      parseDOM: [
        { tag: "u" },
        { tag: "ins" },
        { style: "text-decoration=underline" },
      ],
      toDOM() {
        return ["span", { class: "prosemirror-underline" }, 0];
      },
    },

    /**
     * strike:
     * - is selected when <s> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <s> tag in the zero ‘hole’
     */
    strike: {
      parseDOM: [{ tag: "s" }],
      toDOM() {
        return ["s"];
      },
    },

    /**
     * code:
     * - is selected when <code> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <code> tag in the zero ‘hole’
     */
    code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code"];
      },
    },

    /**
     * link:
     * - attrs:
     *   - href: no default value, so error will be raised if unspecified on node creation
     *   - title: defaults to null if unspecified
     * - is not inclusive, so this mark should not be active when the cursor is positioned
     *   at its end (or at its start when that is also the start of the parent node)
     * - is selected when <a[href]> dom elements are parsed (pasted or dragged in)
     * - is rendered as an HTML <a> tag in the zero ‘hole’
     */
    link: {
      attrs: {
        href: {},
        title: { default: null },
        target: { default: "_blank" },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(dom) {
            return {
              href: (dom as HTMLElement).getAttribute("href"),
              title: (dom as HTMLElement).getAttribute("title"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["a", node.attrs];
      },
    },
  },
});
