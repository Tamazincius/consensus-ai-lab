function calculateConsensus() {

    const claude =
        parseFloat(
            document.getElementById("claudeScore").value
        ) || 0;

    const gemini =
        parseFloat(
            document.getElementById("geminiScore").value
        ) || 0;

    const chatgpt =
        parseFloat(
            document.getElementById("chatgptScore").value
        ) || 0;

    const copilot =
        parseFloat(
            document.getElementById("copilotScore").value
        ) || 0;

    const scores = [
        claude,
        gemini,
        chatgpt,
        copilot
    ];

    const average =
        scores.reduce((a,b)=>a+b,0)
        / scores.length;

    const consensus =
        100 -
        (
            (Math.max(...scores)
            -
            Math.min(...scores))
            * 10
        );

    document.getElementById(
        "averageScore"
    ).innerText =
        average.toFixed(2);

    document.getElementById(
        "consensusScore"
    ).innerText =
        consensus.toFixed(1) + "%";

    document.getElementById(
    "dashboardQuality"
    ).innerText =
         average.toFixed(2);

    document.getElementById(
    "dashboardConsensus"
    ).innerText =
         consensus.toFixed(1)+"%";

    const status =
document.getElementById(
    "dashboardStatus"
);

if(
    average >= 9.6
){
    status.innerText =
        "READY";

    status.style.color =
        "green";
}
else{

    status.innerText =
        "IMPROVE";

    status.style.color =
        "red";
}

}
