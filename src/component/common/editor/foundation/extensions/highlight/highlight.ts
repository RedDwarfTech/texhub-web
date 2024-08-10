import { StateEffect, StateField, Range } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

let curEditorView: EditorView | null = null;

export const highlight_extension = StateField.define({
    create() { return Decoration.none },
    update(value, transaction) {
        debugger
        value = value.map(transaction.changes)
        for (let effect of transaction.effects) {
            if (effect.is(highlight_effect) && effect.value) {
                value = value.update({ add: effect.value, sort: true })
            }
        }
        return value
    },
    provide: f => EditorView.decorations.from(f)
  });

  export const hightlightSelection = (from: number, to: number) => {
    if (!curEditorView) {
        return;
    }
    const highlight_decoration = Decoration.mark({
        attributes: { style: "background-color: yellow" }
    });
    curEditorView.dispatch({
        effects: highlight_effect.of([highlight_decoration.range(from, to)])
    });
}

export const highlightUnselection = () => {
    if (!curEditorView) {
        return;
    }
    const filterMarks = StateEffect.define();
    curEditorView.dispatch({
        effects: filterMarks.of(null)
    })
}

const highlight_effect = StateEffect.define<Range<Decoration>[]>();
