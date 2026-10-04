import { logicJudge } from "./judges/logic";
import { styleJudge } from "./judges/style";
import { businessJudge } from "./judges/business";
import { complianceJudge } from "./judges/compliance";

export async function runValidation(
  content:string
){

  const results =
  await Promise.all([
    logicJudge(content),
    styleJudge(content),
    businessJudge(content),
    complianceJudge(content)
  ]);

  return results;
}
