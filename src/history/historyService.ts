const KEY =
"consensus-history";

export function saveIteration(
 score:number
){

 const current =
 JSON.parse(
  localStorage.getItem(KEY)
  || "[]"
 );

 current.push({

  timestamp:
   Date.now(),

  score

 });

 localStorage.setItem(
  KEY,
  JSON.stringify(current)
 );

}

export function getHistory(){

 return JSON.parse(

  localStorage.getItem(KEY)
  || "[]"

 );

}
