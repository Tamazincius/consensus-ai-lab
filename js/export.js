function exportMarkdown(){

    const content =

`# Consensus AI Report

## Task

${document.getElementById(
    "task"
).value}

## Text

${document.getElementById(
    "text"
).value}

## Verdict

${document.getElementById(
    "finalAuthority"
).value}
`;

    const blob =
        new Blob(
            [content],
            {
                type:
                "text/markdown"
            }
        );

    const a =
        document
        .createElement(
            "a"
        );

    a.href =
        URL
        .createObjectURL(
            blob
        );

    a.download =
        "ConsensusAI.md";

    a.click();

}
