export function detectConflict(
 scores:number[]
){

 const min =
 Math.min(...scores);

 const max =
 Math.max(...scores);

 return (
   max - min
 ) >= 0.5;
}
