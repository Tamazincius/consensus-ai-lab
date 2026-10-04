function exportDocx(){

    const content =

`
TASK

${document.getElementById(
    "task"
).value}

TEXT

${document.getElementById(
    "text"
).value}

VERDICT

${document.getElementById(
    "finalAuthority"
).value}
`;

    const blob =
        new Blob(

            [content],

            {
                type:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            }

        );

    const a =
        document
        .createElement("a");

    a.href =
        URL.createObjectURL(
            blob
        );

    a.download =
        "ConsensusAI.docx";

    a.click();

}
