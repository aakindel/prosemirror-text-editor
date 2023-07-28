// adapted from https://github.com/ProseMirror/prosemirror-example-setup/blob/master/src/inputrules.ts; https://dragonman225.js.org/prosemirror-notes.html; https://dragonman225.js.org/prosemirror-inputrules-md-regex.html

/* An input rule is something that should happen when input matching a given pattern is typed. */
import {
  inputRules,
  InputRule,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
} from "prosemirror-inputrules";
import { Mark, MarkType, NodeType, Schema } from "prosemirror-model";

/**
 * Given a blockquote node type, returns an input rule that turns `"> "`
 * at the start of a textblock into a blockquote.
 */
export function blockQuoteRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*>\s$/, nodeType);
}

/**
 * Given a list node type, returns an input rule that turns a number
 * followed by a dot at the start of a textblock into an ordered list.
 */
export function orderedListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    (match) => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order == +match[1]
  );
}

/**
 * Given a list node type, returns an input rule that turns a bullet
 * (dash, plush, or asterisk) at the start of a textblock into a
 * bullet list.
 */
export function bulletListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

/**
 * Given a code block node type, returns an input rule that turns a
 * textblock starting with three backticks into a code block.
 */
export function codeBlockRule(nodeType: NodeType) {
  return textblockTypeInputRule(/^```$/, nodeType);
}

/**
 * Given a node type and a maximum level, creates an input rule that
 * turns up to that number of `#` characters followed by a space at
 * the start of a textblock into a heading whose level corresponds to
 * the number of `#` signs.
 */
export function headingRule(nodeType: NodeType, maxLevel: number) {
  return textblockTypeInputRule(
    new RegExp("^(#{1," + maxLevel + "})\\s$"),
    nodeType,
    (match) => ({ level: match[1].length })
  );
}

/* regex from https://dragonman225.js.org/prosemirror-inputrules-md-regex.html
To match **bold**, you write: /(?<=[^*\n]|^)\*\*([^*\n]+)\*\*$/

The first part (?<=[^*\n]|^) uses a Positive Lookbehind operator (?<=...) 
to tell the regex engine to match something, but not to add it to the match 
(so when you want to match x**abc**, you don't get the "x" in the result). 
[^*\n] says to match a character that is not * or \n. 
|^ says to also match the beginning of a line.

The second part is trivial. \*\* matches two *s, to find the first two 
characters of **bold**. \ escapes * to treat it as a character.

We can now go back to the first part. The reason of the first part is to 
ensure that there’re no *s before ** that we want to match, so we can match 
exactly two *s. If there’re three, we don’t match, 
so other rules that match three works.

The third part ([^*\n]+) is to capture the text between the pair of **. 
+ says that it’ll match one or more characters. 
[^*\n] excludes *, since * would suggest the end of the pair, 
and \n, since we’re matching inline styles, so no newline!

The final part \*\*$ ensures the end of the pair.

In conclusion, there’re four parts in this regex structure — 
Guard + Match the Start + Wrapping Text + Ensure the End.
Now we can write more regexes based on this structure.
*/
export const REGEX_BOLD_ITALIC_TRIPLE_STARS = new RegExp(
  "(?<=[^*\\n]|^)\\*\\*\\*([^*\\n]+)\\*\\*\\*$"
);
export const REGEX_BOLD_DOUBLE_STARS = new RegExp(
  "(?<=[^*\\n]|^)\\*\\*([^*\\n]+)\\*\\*$"
);
export const REGEX_BOLD_DOUBLE_UNDERSCORES = new RegExp(
  "(?<=[^_\\n]|^)\\_\\_([^_\\n]+)\\_\\_$"
);
export const REGEX_ITALIC_SINGLE_UNDERSCORE = new RegExp(
  "(?<=[^_\\n]|^)\\_([^_\\n]+)\\_$"
);
export const REGEX_ITALIC_SINGLE_STAR = new RegExp(
  "(?<=[^*\\n]|^)\\*([^*\\n]+)\\*$"
);
export const REGEX_CODE_SINGLE_BACKTICK = new RegExp("`(.+)`");
export const REGEX_STRIKE_DOUBLE_TILDE = new RegExp("~~(.+)~~");
export const REGEX_UNDERLINE_DOUBLE_PLUS = new RegExp("\\+\\+(.+)\\+\\+");

/* A mark is a piece of information that can be attached to a node, 
   such as it being emphasized, in code font, or a link. It has a 
   type and optionally a set of attributes that provide further 
   information (such as the target of the link). */
/**
 * from https://dragonman225.js.org/prosemirror-notes.html and
 * https://discuss.prosemirror.net/t/input-rules-for-wrapping-marks/537/11
 * Given a pattern and a mark type or array of mark types, builds
 * an input rule for automatically marking a string when a string
 * matching the pattern is typed in.
 */
export function markingInputRule(
  pattern: RegExp,
  markTypeOrMarkTypes: MarkType | MarkType[]
): InputRule {
  return new InputRule(pattern, (state, match, start, end) => {
    let marks: Mark[] = [];
    let tr = state.tr;

    // get the string that matches pattern, excluding the pattern tokens
    if (match[1]) {
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;
      if (textEnd < end) tr.delete(textEnd, end);
      if (textStart > start) tr.delete(start, textStart);
      end = start + match[1].length;
    }

    // create an array of marks for the passed in mark type or mark types
    if (Array.isArray(markTypeOrMarkTypes)) {
      const markTypes = markTypeOrMarkTypes;
      marks = markTypes.map((mt) => mt.create());

      // if multiple marks, add each mark to the transaction
      marks.forEach((m) => {
        tr = tr.addMark(start, end, m);
      });
    } else {
      const markType = markTypeOrMarkTypes;
      marks = [markType.create()];

      // if single mark, add the mark to the transaction
      tr.addMark(start, end, marks[0]);
    }

    /* for each mark, remove the mark from the transaction so that
       new text that the user types is not marked with stale marks */
    marks.forEach((m) => {
      tr = tr.removeStoredMark(m);
    });

    // return the transaction
    return tr;
  });
}

/**
 * A set of input rules for creating the basic block quotes,
 * lists, code blocks, headings, marked text, and more.
 */
export function buildInputRules(schema: Schema) {
  const rules = smartQuotes.concat(ellipsis, emDash);
  let type;
  if ((type = schema.nodes.blockquote)) rules.push(blockQuoteRule(type));
  if ((type = schema.nodes.ordered_list)) rules.push(orderedListRule(type));
  if ((type = schema.nodes.bullet_list)) rules.push(bulletListRule(type));
  if ((type = schema.nodes.code_block)) rules.push(codeBlockRule(type));
  if ((type = schema.nodes.heading)) rules.push(headingRule(type, 6));
  rules.push(
    ...[
      markingInputRule(REGEX_BOLD_ITALIC_TRIPLE_STARS, [
        schema.marks.strong,
        schema.marks.em,
      ]),
      markingInputRule(REGEX_BOLD_DOUBLE_STARS, schema.marks.strong),
      markingInputRule(REGEX_BOLD_DOUBLE_UNDERSCORES, schema.marks.strong),
      markingInputRule(REGEX_ITALIC_SINGLE_UNDERSCORE, schema.marks.em),
      markingInputRule(REGEX_ITALIC_SINGLE_STAR, schema.marks.em),
      markingInputRule(REGEX_CODE_SINGLE_BACKTICK, schema.marks.code),
      markingInputRule(REGEX_STRIKE_DOUBLE_TILDE, schema.marks.strike),
      markingInputRule(REGEX_UNDERLINE_DOUBLE_PLUS, schema.marks.underline),
    ]
  );
  return inputRules({ rules });
}
