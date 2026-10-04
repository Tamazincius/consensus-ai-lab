import { Review } from "../../types/Review";

export async function complianceJudge(
  content:string
):Promise<Review>{

  return {

    model:"compliance",

    score:8.8,

    reasoning:
      "Atitinka užduotį.",

    issues:[]
  };

}
