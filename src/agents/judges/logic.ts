import { Review } from "../../types/Review";

export async function logicJudge(
  content:string
):Promise<Review>{

  return {

    model:"logic",

    score:8.5,

    reasoning:
      "Logiškai nuoseklus tekstas.",

    issues:[]
  };

}
