function generatePrompt(){

const task =
document.getElementById("task").value;

const text =
document.getElementById("text").value;

const prompt =

`Vertink tekstą.

Užduotis:

${task}

Tekstas:

${text}

Grąžink JSON:

{
 "score":0,
 "strengths":[],
 "issues":[],
 "recommendations":[]
}`;

document.getElementById("prompt")
.value = prompt;

}
