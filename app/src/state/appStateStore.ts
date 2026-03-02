import type { AppState } from "@core";

export interface DemoPreset {
  id: string;
  label: string;
  description: string;
  state: AppState;
}

export const milestone2Presets: readonly DemoPreset[] = Object.freeze([
  {
    id: "c-major-scale",
    label: "C Major Scale",
    description: "Scale-only highlight coverage across frets 0-17.",
    state: {
      noteNamingPolicy: "sharps",
      keyScale: { rootPitchClass: 0, scaleType: "major" },
      chord: null,
      includeIntervals: [],
      excludeIntervals: [],
    },
  },
  {
    id: "c-key-g7",
    label: "C Key + G7",
    description:
      "Chord tones stay bright while non-chord scale tones de-emphasize.",
    state: {
      noteNamingPolicy: "sharps",
      keyScale: { rootPitchClass: 0, scaleType: "major" },
      chord: {
        rootPitchClass: 7,
        quality: "dominant7",
        extensions: [],
        alterations: [],
      },
      includeIntervals: [],
      excludeIntervals: [],
    },
  },
  {
    id: "g-major-omit3",
    label: "G Omit 3",
    description: "Chord omit behavior example: G major with excluded 3rd.",
    state: {
      noteNamingPolicy: "sharps",
      keyScale: null,
      chord: {
        rootPitchClass: 7,
        quality: "major",
        extensions: [],
        alterations: [],
      },
      includeIntervals: [],
      excludeIntervals: ["3"],
    },
  },
]);

export const getPresetById = (id: string): DemoPreset =>
  milestone2Presets.find((preset) => preset.id === id) ?? milestone2Presets[0]!;
