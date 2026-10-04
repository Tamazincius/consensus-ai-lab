import { Review } from "../../types/Review";

export async function businessJudge(
  content:string
):Promise<Review>{

  return {

    model:"business",

    score:8.4,

    reasoning:
      "Pakankama verslo vertė.",

    issues:[]
  };

}
