let chart;

function updateChart(
    value
){

    const canvas =
        document
        .getElementById(
            "qualityChart"
        );

    if(!canvas) return;

    const ctx =
        canvas.getContext(
            "2d"
        );

    if(!window.historyScores){

        window.historyScores =
            [];

    }

    window.historyScores.push(
        value
    );

    if(chart){

        chart.destroy();

    }

    chart =
    new Chart(ctx,{

        type:"line",

        data:{

            labels:
                window
                .historyScores
                .map(
                    (_,i)=>
                    "v"+(i+1)
                ),

            datasets:[{

                label:
                    "Average Score",

                data:
                    window
                    .historyScores

            }]

        }

    });

}
