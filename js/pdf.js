async function exportPDF(){

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const task =
        document.getElementById(
            "task"
        ).value;

    const text =
        document.getElementById(
            "text"
        ).value;

    const verdict =
        document.getElementById(
            "finalAuthority"
        ).value;

    doc.text(
        "Consensus AI Report",
        20,
        20
    );

    doc.text(
        "Task:",
        20,
        40
    );

    doc.text(
        task,
        20,
        50
    );

    doc.text(
        "Verdict:",
        20,
        90
    );

    doc.text(
        verdict,
        20,
        100
    );

    doc.save(
        "ConsensusAI.pdf"
    );

}
