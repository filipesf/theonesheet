export type FeatFace =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 'gandalf'
  | 'eye';

export type SuccessFace = 1 | 2 | 3 | 4 | 5 | 6;

export type RollOutcome =
  | 'success'
  | 'failure'
  | 'magical'
  | 'great'
  | 'extraordinary'
  | 'no-tn'
  | 'auto-fail';

export type RollRequest = {
  label: string;
  successDice: number;
  tn: number | null;
  weary: boolean;
  miserable: boolean;
  characterId: string | null;
};

export type RollResult = {
  id: string;
  rolledAt: string;
  request: RollRequest;
  feat: FeatFace;
  successDice: SuccessFace[];
  successes: number;
  total: number;
  outcome: RollOutcome;
};

export function classifyFeat(raw: number): FeatFace {
  if (raw === 11) return 'gandalf';
  if (raw === 12) return 'eye';
  return raw as FeatFace;
}

export function evaluate(
  request: RollRequest,
  feat: FeatFace,
  successFaces: SuccessFace[],
): RollResult {
  const counted = successFaces.map((face) => (request.weary && face <= 3 ? 0 : face));
  const baseSum = counted.reduce<number>((sum, face) => sum + face, 0);
  const featValue = feat === 'gandalf' ? 0 : feat === 'eye' ? 0 : feat;
  const total = featValue + baseSum;
  const tengwar = successFaces.filter((face) => face === 6).length;

  let outcome: RollOutcome;
  if (request.miserable && feat === 'eye') {
    outcome = 'auto-fail';
  } else if (request.tn === null) {
    outcome = 'no-tn';
  } else if (feat === 'gandalf' || total >= request.tn) {
    if (tengwar >= 3) outcome = 'extraordinary';
    else if (tengwar === 2) outcome = 'great';
    else if (feat === 'gandalf') outcome = 'magical';
    else outcome = 'success';
  } else {
    outcome = 'failure';
  }

  return {
    id: crypto.randomUUID(),
    rolledAt: new Date().toISOString(),
    request,
    feat,
    successDice: successFaces,
    successes: tengwar,
    total,
    outcome,
  };
}

export function rollDice(request: RollRequest): RollResult {
  const featRaw = 1 + Math.floor(Math.random() * 12);
  const feat = classifyFeat(featRaw);
  const successFaces: SuccessFace[] = Array.from(
    { length: request.successDice },
    () => (1 + Math.floor(Math.random() * 6)) as SuccessFace,
  );
  return evaluate(request, feat, successFaces);
}
