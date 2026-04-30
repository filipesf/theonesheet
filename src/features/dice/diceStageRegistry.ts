/**
 * Module-level handle to the single `<DiceStage />` mounted at the app root.
 * `DiceStage` registers itself once it is ready; consumers call
 * `rollViaStage()` and get back resolved face values, or `null` if the stage
 * is not available (motion-reduced, init failed, or not mounted yet).
 */

export type StageRollResult = {
  featRaw: number;
  successFaces: number[];
};

export type DiceStageHandle = {
  roll: (featCount: number, successCount: number) => Promise<StageRollResult>;
  isReady: () => boolean;
};

let handle: DiceStageHandle | null = null;

export function registerStage(next: DiceStageHandle | null): void {
  handle = next;
}

export async function rollViaStage(
  featCount: number,
  successCount: number,
): Promise<StageRollResult | null> {
  if (!handle || !handle.isReady()) return null;
  try {
    return await handle.roll(featCount, successCount);
  } catch {
    return null;
  }
}
