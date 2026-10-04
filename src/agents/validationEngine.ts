import { logicJudge }
from "./judges/logic";

import { styleJudge }
from "./judges/style";

import { businessJudge }
from "./judges/business";

import { complianceJudge }
from "./judges/compliance";

import {
 ValidationReport
}
from "../types/ValidationReport";

export async function runValidation(
 content:string
):Promise<ValidationReport>{

 const reviews =
 await Promise.all([

  logicJudge(content),

  styleJudge(content),

  businessJudge(content),

  complianceJudge(content)

 ]);

 const scores =
 reviews.map(
  r => r.score
 );

 const average =
 scores.reduce(
  (a,b)=>a+b,0
 ) / scores.length;

 return {

  averageScore:average,

  minimumScore:
    Math.min(...scores),

  maximumScore:
    Math.max(...scores),

  conflicts:0,

  factErrors:0,

  reviews

 };

}
