import { Extension } from "@codemirror/state";
import { basicLight } from 'cm6-theme-basic-light';
import { solarizedLight } from 'cm6-theme-solarized-light';

export const themeMap: Map<string, Extension> = new Map<string, Extension>();
themeMap.set('Solarized Light', solarizedLight);
themeMap.set('Basic Light', basicLight);

