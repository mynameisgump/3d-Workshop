import { atom } from "jotai";

const slideShowIndex = atom<number>(0);
const codeScreenActive = atom<boolean>(false);
const sceneLights = atom<string>("normal");

export { slideShowIndex, codeScreenActive, sceneLights };
