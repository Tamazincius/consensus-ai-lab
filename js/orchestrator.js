async function startPipeline(){

    generatePrompt();

    calculateConsensus();

    detectConflicts();

    buildConflictTree();

    finalAuthority();

}
