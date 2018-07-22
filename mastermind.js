window.addEventListener("load", load);

function load() {
    initializeControls();
    //initializeGame();
}

function log(message) {
    var logElement = document.getElementById("log");
    logElement.textContent += message + "\n";
    logElement.scrollTop = logElement.scrollHeight;
}

function initializeControls() {
    var buttons = document.querySelectorAll("button.dynamic");
    buttons.forEach(function (button) {
        button.addEventListener("click", dynamicButtonClicked);
    });

    var selectors = document.querySelectorAll("select.dynamic");
    selectors.forEach(function (selector) {
        selector.addEventListener("change", dynamicSelectorChanged);
        selector.dispatchEvent(new Event("change"));
    });
}

function dynamicButtonClicked(e) {
    var button = e.target;
    var name = button.dataset.name;
    var handler = window[name];

    handler.call(e);
}

function dynamicSelectorChanged(e) {
    var selector = e.target;
    var value = selector.value;
    var name = selector.dataset.name;

    document.body.dataset[name] = value;
}

function initializeGame() {
    clearBoard();
    clearLog();


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

function clearLog() {
    var logElement = document.getElementById("log");
    logElement.textContent = "";

}

function clearBoard() {
    var board = document.querySelector(".board");
    if (board) {
        board.remove();
    }

}

function solveConstructive(board, solution, colorLength, rowLength) {
    var thesis = [];

    do {

        createThesis(thesis, rowLength, colorLength, board);

        var row = createAndScore(board, thesis, solution);

        log("add [" + thesis + "] → [" + row.score.color + "," + row.score.position + "]");

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

            return row.score.position < numberOfPositionMatches; //TODO: this is lt when partial thesis, eq when full
        });

        if (results.length) {
            return true;
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

            return matches < numberOfColorMatches; //TODO: this is lt when partial thesis, eq when full
        });

        if (results.length) {
            return true;
        }
    };


    //a();
    //b();
    if (c()) {
        log("con [" + thesis + "] (C)");
        return true;
    }

    if (d()) {
        log("con [" + thesis + "] (D)");
        return true;
    }

    return false;
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
    var gameElement = document.getElementById("game");
    var boardElement = element("board", gameElement);
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