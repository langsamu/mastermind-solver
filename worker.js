const mapping = { "solveConstructive": solveConstructive };

this.onmessage = function (e) {
    mapping[e.data.name].apply(this, e.data.payload);
}

function solveConstructive(board, solution, colorLength, rowLength) {
    var thesis = [0];

    do {
        getNextThesis(thesis, rowLength, colorLength, board);

        var row = { cells: thesis.slice() };

        row.score = scoreRow(row.cells, solution);

        board.push(row);

        postMessage({ name: "rowPushed", payload: [row] });

    } while (row.score.position !== rowLength);
}

function getNextThesis(thesis, rowLength, colorLength, board) {
    do {
        if (thesis.length === rowLength) {
            incrementThesis(thesis, colorLength);
        } else {
            thesis.push(0);
        }

        while (contradicts(thesis, board)) {
            incrementThesis(thesis, colorLength);
        }
    } while (thesis.length < rowLength);
}

function contradicts(thesis, board) {
    for (var i = 0; i < board.length; i++) { // TODO: maybe iterate backwards? = No apparent difference
        var row = board[i];
        var cells = row.cells;
        var actualScore = row.score;

        var thesisScore = scoreRow(thesis, cells);
        postMessage({ name: "thesis", payload: [{ cells: thesis, score: thesisScore }] });

        if (thesisScore.position > actualScore.position) { // TODO: take thesis length into consideration
            //log("con position [" + thesis + "] [" + cells + "]");
            return true;
        }

        if (thesisScore.color > actualScore.color + actualScore.position) { // TODO: take thesis length into consideration
            //log("con color [" + thesis + "] [" + cells + "]");
            return true;
        }

        if (thesis.length === cells.length) {
            if (thesisScore.position !== actualScore.position) {
                //log("con position5 [" + thesis + "] [" + cells + "]");
                return true;
            }
            if (thesisScore.color !== actualScore.color) {
                //log("con color5 [" + thesis + "] [" + cells + "]");
                return true;
            }
        }
    }

    return false;
}

function scoreRow(proposed, actual) {
    proposed = proposed.slice();
    actual = actual.slice();

    var positionMatches = getPositionMatches(proposed, actual);
    var colorMatches = getColorMatches(proposed, actual);

    var result = {
        position: positionMatches,
        color: colorMatches
    };

    return result;
}

function getPositionMatches(proposed, actual) {
    var result = 0;

    for (var proposedPosition = 0; proposedPosition < proposed.length; proposedPosition++) {
        var proposedCell = proposed[proposedPosition];
        var actualCell = actual[proposedPosition];

        if (proposedCell === actualCell) {
            proposed[proposedPosition] = NaN;
            actual[proposedPosition] = NaN;

            result++;
        }
    }

    return result;
}

function getColorMatches(proposed, actual) {
    var result = 0;

    for (var proposedPosition = 0; proposedPosition < proposed.length; proposedPosition++) {
        var proposedCell = proposed[proposedPosition];
        var actualPosition = actual.indexOf(proposedCell);

        if (actualPosition !== -1) {
            proposed[proposedPosition] = NaN;
            actual[actualPosition] = NaN;

            result++;
        }
    }

    return result;
}

function incrementThesis(thesis, colorLength) {
    while (thesis[thesis.length - 1] === colorLength - 1) {
        thesis.pop();
    }

    if (!thesis.length) {
        throw "Got to end of number space (increment wrap-around)";
    }

    thesis[thesis.length - 1]++;
}
