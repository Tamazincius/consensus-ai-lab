export const LOOP_RULES = {

  maxIterations:10,

  stagnationLimit:3,

  minimumImprovement:0.05
};

export function shouldContinue(
  scores:number[]
):boolean {

  if(scores.length < 2){
    return true;
  }

  const current =
    scores[scores.length-1];

  const previous =
    scores[scores.length-2];

  const improvement =
    current - previous;

  return (
    improvement >=
    LOOP_RULES.minimumImprovement
  );
}
