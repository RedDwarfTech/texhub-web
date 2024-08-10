import { LanguageDescription } from '@codemirror/language'

export const languages = [
    LanguageDescription.of({
        name: 'latex',
        extensions : [],
        load: () => {
            return import('./latex').then(m => m.latex())
        }
    })
];

