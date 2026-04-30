/// <reference types="vite/client" />

declare module '@3d-dice/dice-box' {
  export type DiceBoxConfig = {
    assetPath: string;
    container?: string;
    id?: string;
    theme?: string;
    themeColor?: string;
    scale?: number;
    origin?: string;
    [key: string]: unknown;
  };

  export type DiceBoxRollDie = {
    sides: number | string;
    value: number;
    [key: string]: unknown;
  };

  export type DiceBoxRollResult = {
    qty?: number;
    value?: number;
    sides?: number | string;
    rolls?: DiceBoxRollDie[];
    [key: string]: unknown;
  };

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    constructor(selector: string, config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string | string[]): Promise<DiceBoxRollResult[]>;
    add(notation: string | string[]): Promise<DiceBoxRollResult[]>;
    clear(): void;
    updateConfig(config: Partial<DiceBoxConfig>): Promise<void>;
    resizeWorld?: () => void;
    onRollComplete: (results: DiceBoxRollResult[]) => void;
    onBeforeRoll: (...args: unknown[]) => void;
    onDieComplete: (...args: unknown[]) => void;
    onRemoveComplete: (...args: unknown[]) => void;
    onThemeLoaded: (...args: unknown[]) => void;
    onThemeConfigLoaded: (...args: unknown[]) => void;
  }
}
