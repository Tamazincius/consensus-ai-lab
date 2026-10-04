import { Review } from "./Review";

export interface ValidationReport {

  averageScore:number;

  minimumScore:number;

  maximumScore:number;

  conflicts:number;

  factErrors:number;

  reviews:Review[];

}
