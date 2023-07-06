import { baseKeymap } from "prosemirror-commands";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { schema } from "./schema";
import { buildKeymap } from "./keymap";
import { buildInputRules } from "./inputrules";

/* when a user types or otherwise interacts with the view, a transaction is dispatched, i.e.:
   - the keypress/interaction creates a state transaction
     (a transaction describes the changes that are made to the state)
   - the transaction is applied to create a new state
   - the new state is used to update the view */
/* plugins extend how the editor(state) behaves by influencing how transactions are applied */
export const plugins = [
  history(), // implements an undo history by observing transactions and storing their inverse in case the user wants to undo them
  buildInputRules(schema),
  keymap(buildKeymap(schema)), // binds actions to keyboard input
  keymap(baseKeymap), // binds actions to keyboard input
  dropCursor(),
  gapCursor(),
];
