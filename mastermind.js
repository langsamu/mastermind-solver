window.addEventListener("load", load);

function load() {
    var rowLength = 5;
    var colorLength = 8;
    var solution = randomRow(rowLength, colorLength);

    var board = [];
    window.board = board;

    var boardElement = drawBoard(board);

    var solutionElement = element("solution");
    boardElement.insertBefore(solutionElement, boardElement.firstElementChild);

    drawRow(solutionElement, solution);

    solveConstructive(board, solution, colorLength, rowLength);
    //solveSerial(board, solution, colorLength, rowLength);
    //solveRandom(board, solution, colorLength, rowLength);
}

function solveConstructive(board, solution, colorLength, rowLength) {
    var thesis = [];

    do {

        createThesis(thesis, rowLength, colorLength, board);

        var row = createAndScore(board, thesis, solution);
    } while (row.score.position !== rowLength);
}

function createThesis(thesis, rowLength, colorLength, board) {
    do {
        if (thesis.length === rowLength) {
            increment(thesis, colorLength);
        } else {
            thesis.push(0);
        }

        while (contradicts(thesis, board)) {
            increment(thesis, colorLength);
        }
    } while (thesis.length < rowLength);
}

function increment(thesis, colorLength) {
    while (thesis[thesis.length - 1] === colorLength - 1) {
        thesis.pop();
    }

    if (!thesis.length) {
        throw "Got to end of number space (increment wrap-around)";
    }

    thesis[thesis.length - 1]++;
}

function contradicts(thesis, board) {
    var contradiction = false;

    // are there rows with no matches that have any of my colors?
    var a = function () {
        thesis.forEach(function (cell) {
            var results = board.filter(function (row) {
                return row.score.color === 0 && row.score.position === 0;
            }).filter(function (row) {
                return row.cells.indexOf(cell) !== -1;
            });

            if (results.length) {
                contradiction = true;
                return;
            }
        });
    };

    // are there rows with any of my cells in the same position with no position match?
    var b = function () {
        thesis.forEach(function (cell, i) {
            var results = board.filter(function (row) {
                return row.cells[i] === cell;
            }).filter(function (row) {
                return row.score.position === 0;
            });

            if (results.length) {
                contradiction = true;
                return;
            }
        });
    };

    // are there rows where the number of cells in same position is greater than the number of position matches?
    var c = function () {
        var results = board.filter(function (row) {
            var numberOfPositionMatches = row.cells.filter(function (cell, i) {
                return cell === thesis[i];
            }).length;

            return row.score.position < numberOfPositionMatches;
        });

        if (results.length) {
            contradiction = true;
            return;
        }
    };

    // are there rows where the number of cells with same color is greater than the number of color matches?
    var d = function () {
        var results = board.filter(function (row) {
            var rowClone = Array.from(row.cells);

            var numberOfColorMatches = thesis.filter(function (cell) {
                var position = rowClone.indexOf(cell);
                if (position !== -1) {
                    rowClone[position] = NaN;

                    return true;
                }
            }).length;

            var matches = row.score.color + row.score.position;

            return matches < numberOfColorMatches;
        });

        if (results.length) {
            contradiction = true;
            return;
        }
    };


    //a();
    //b();
    c();
    d();

    return contradiction;
}

function solveSerial(board, solution, colorLength, rowLength) {
    var max = Math.pow(colorLength, rowLength);

    for (var rowNumber = 0; rowNumber < max; rowNumber++) {
        var row = numberedRow(rowNumber, rowLength, colorLength);

        var rowScore = createAndScore(board, row, solution);

        if (rowScore.position === rowLength) {
            break;
        }
    }
}

function solveRandom(board, solution, colorLength, rowLength) {
    var done = false;
    while (!done) {
        var row = randomRow(rowLength, colorLength);

        var rowScore = createAndScore(board, row, solution);

        done = rowScore.position === rowLength;
    }
}

function createAndScore(board, row, solution) {
    var rowObject = { cells: Array.from(row) };

    var rowsElement = document.querySelector(".rows");
    var rowElement = drawRow(rowsElement, rowObject.cells);
    rowObject.score = scoreRow(rowObject.cells, solution);

    board.push(rowObject);

    drawScore(rowElement, rowObject.score);

    rowElement.scrollIntoView();

    return rowObject;
}

function numberedRow(i, length, base) {
    var numberString = i.toString(base);
    var padded = padLeft(numberString, length, "0");
    var stringArray = padded.split("");

    return stringArray.map(function (character) {
        return parseInt(character, base);
    });
}

function padLeft(original, targetLength, padString) {
    var arrayOfLength = new Array(targetLength + 1);
    var stringOfLength = arrayOfLength.join(padString);
    var tooLongString = stringOfLength + original;

    return tooLongString.slice(-targetLength)
}

function randomBoard(length, rowLength, colorLength) {
    var board = [];

    for (var i = 0; i < length; i++) {
        var row = randomRow(rowLength, colorLength);

        board.push(row);
    }

    return board;
}

function randomRow(length, colorLength) {
    var row = [];

    for (var i = 0; i < length; i++) {
        var cell = randomCell(colorLength);

        row.push(cell);
    }

    return row;
}

function randomCell(length) {
    return Math.floor(Math.random() * length);
}

function drawScore(row, score) {
    var scoreElement = element("score", row);

    for (var i = 0; i < score.color; i++) {
        var positionElement = element("color", scoreElement);
    }

    for (var i = 0; i < score.position; i++) {
        var positionElement = element("position", scoreElement);
    }

    return scoreElement;
}

function scoreRow(row, solution) {
    var correctColor = 0;
    var correctPosition = 0;
    var solutionClone = Array.from(solution);
    var rowClone = Array.from(row);

    rowClone.forEach(function (cell, i) {
        if (solutionClone[i] === cell) {
            solutionClone[i] = NaN;
            rowClone[i] = NaN;

            correctPosition++;
        }
    });

    rowClone.forEach(function (cell, i) {
        if (solutionClone.indexOf(cell) !== -1) {
            solutionClone[solutionClone.indexOf(cell)] = NaN;

            correctColor++;
        }
    });

    return {
        color: correctColor,
        position: correctPosition
    };
}

function drawBoard(board) {
    var boardElement = element("board", document.body);
    boardElement.board = board;

    var rowsElement = element("rows", boardElement);

    board.forEach(function (row) {
        drawRow(rowsElement, row);
    });

    return boardElement;
}

function drawRow(parent, row) {
    var rowElement = element("row", parent);
    rowElement.dataset.row = row;

    var cellsElement = element("cells", rowElement);

    row.forEach(function (cell) {
        drawCell(cellsElement, cell);
    });

    return rowElement;
}

function drawCell(rowElement, cell) {
    var cellElement = element("cell", rowElement);

    cellElement.dataset.color = cell;
}

function element(className, parent) {
    var result = document.createElement("div");

    if (parent) {
        parent.appendChild(result);
    }

    result.className = className;

    return result;
}