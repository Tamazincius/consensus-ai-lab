import { Review } from "../../types/Review";

export async function styleJudge(
  content:string
):Promise<Review>{

  return {

    model:"style",

    score:8.7,

    reasoning:
      "Sklandus stilius.",

    issues:[]
  };

}
