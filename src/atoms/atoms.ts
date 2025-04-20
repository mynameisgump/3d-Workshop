import { atom } from "jotai";

const slideShowIndex = atom<number>(0);
const codeScreenActive = atom<boolean>(false);
export { slideShowIndex, codeScreenActive };
