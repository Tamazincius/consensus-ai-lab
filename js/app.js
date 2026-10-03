function generatePrompt() {

    const task =
        document.getElementById("task").value;

    const text =
        document.getElementById("text").value;

    const prompt =

`Įvertink tekstą.

UŽDUOTIS

${task}

TEKSTAS

${text}

Vertink:

1. Užduoties įvykdymą
2. Logiką
3. Faktus
4. Struktūrą
5. Kalbą
6. Praktinę vertę

Grąžink JSON:

{
 "score":0,
 "strengths":[],
 "issues":[],
 "recommendations":[]
}`;

    document.getElementById(
        "promptOutput"
    ).value = prompt;

}
