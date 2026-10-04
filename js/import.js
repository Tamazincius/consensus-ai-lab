function importReviewer(){

    const json =
        document.getElementById(
            "reviewerImport"
        ).value;

    try{

        const review =
            JSON.parse(json);

        document.getElementById(
            "importedScore"
        ).innerText =
            review.score;

    }

    catch{

        alert(
            "Neteisingas JSON"
        );

    }

}
