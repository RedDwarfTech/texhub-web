import { Compartment } from "@codemirror/state";
import { LanguageDescription } from '@codemirror/language';
import { languages } from ".";

const languageCompartment = new Compartment();

export const language = (docName: string,) => {
    return languageCompartment.of(buildExtension(docName));
};

const buildExtension = (docName: string,):[] => {
    LanguageDescription.matchFilename(languages,
        docName);
        return [];
}
