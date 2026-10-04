import {
 ValidationReport
}
from "../types/ValidationReport";

export interface ConsensusResult {

 approved:boolean;

 average:number;

 minimum:number;

 conflicts:number;

 factErrors:number;
}

export function evaluateConsensus(
 report:ValidationReport
):ConsensusResult {

 const approved =

 report.minimumScore >= 9.6

 &&

 report.averageScore >= 9.7

 &&

 report.conflicts === 0

 &&

 report.factErrors === 0;

 return {

  approved,

  average:
   report.averageScore,

  minimum:
   report.minimumScore,

  conflicts:
   report.conflicts,

  factErrors:
   report.factErrors
 };

}
