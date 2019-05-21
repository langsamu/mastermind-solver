window.addEventListener("load", load);

const mapping = {
    "rowPushed": rowPushed,
    "thesis": thesis
};

let queue = [];

const w = new Worker("worker.js");
w.onmessage = function (e) {
    if (document.body.dataset.x === "true") {
        queue.push(e.data);
    } else {
        mapping[e.data.name].apply(this, e.data.payload);
    }
};

function process() {
    if (document.body.dataset.x === "true") {
        console.log("process");
        requestAnimationFrame(process);

        const message = queue.shift();
        if (message) {
            mapping[message.name].apply(this, message.payload);
        }

    }
}

function rowPushed(row) {
    if (fake) {
        fake.remove();
        fake = undefined;
    } else { }

    drawRow(document.querySelector(".rows"), row);
}

let fake;
function thesis(row) {
    if (fake) {
        var a = fake.childNodes[0].childNodes;
        var b = fake.childNodes[1].childNodes;
        for (var i = 0; i < rowLength; i++) {
            a[i].dataset.color = row.cells[i];

            if (i < row.score.color) {
                b[i].className = "color";
            } else if (i - row.score.color < row.score.position) {
                b[i].className = "position";
            } else {
                b[i].className = "";
            }
        }
    } else {
        fake = drawRow(document.querySelector(".rows"), row);
    }
}

function load() {
    initializeControls();
    //initializeGame();
}

var rowLength = 5;
var colorLength = 8;
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

    var checks = document.querySelectorAll("input.dynamic");
    checks.forEach(function (selector) {
        selector.addEventListener("change", dynamicCheckboxChanged);
        selector.dispatchEvent(new Event("change"));
    });
}
function initializeGame() {
    process();
    clearBoard();
    queue = [];

    var solution = randomRow(rowLength, colorLength);
    //var solution = [1, 6, 0, 7, 6]; // Bence 20170123T2054
    //var solution = [6, 7, 3, 3, 2]; // Bence 20170130T1005
    //var solution = [7, 6, 5, 4, 3];
    //var solution = [0, 1, 2, 3, 4];
    //var solution = [3, 4, 5, 6, 7];
    //var solution = [7, 7, 7, 7, 6];

    var board = [];

    w.postMessage({
        name: "solveConstructive",
        payload: [board, solution, colorLength, rowLength]
    });
    //solveConstructive(board, solution, colorLength, rowLength);

    var gameElement = document.getElementById("game");
    var boardElement = drawBoard(gameElement, board);

    var solutionElement = drawElement(null, "solution");
    boardElement.insertBefore(solutionElement, boardElement.firstElementChild);

    drawRow(solutionElement, { cells: solution });

    //solveSerial(board, solution, colorLength, rowLength);
    //solveRandom(board, solution, colorLength, rowLength);
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
function dynamicCheckboxChanged(e) {
    var selector = e.target;
    var value = selector.checked;
    var name = selector.dataset.name;

    document.body.dataset[name] = value;
    console.log(value);
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

function drawBoard(parentElement, board) {
    var boardElement = drawElement(parentElement, "board");
    var rowsElement = drawElement(boardElement, "rows");

    board.forEach(function (row) {
        drawRow(rowsElement, row);
    });

    return boardElement;
}
function drawRow(parentElement, row) {
    var rowElement = drawElement(parentElement, "row");
    var cellsElement = drawElement(rowElement, "cells");

    for (var i = 0; i < rowLength; i++) {
        drawCell(cellsElement, row.cells[i]);
    }

    if (row.score) {
        drawScore(rowElement, row.score);
    }

    return rowElement;
}
function drawScore(parentElement, score) {
    var scoreElement = drawElement(parentElement, "score");

    for (var i = 0; i < rowLength; i++) {
        if (i < score.color) {
            drawElement(scoreElement, "color");
        } else if (i - score.color < score.position) {
            drawElement(scoreElement, "position");
        } else {
            drawElement(scoreElement);
        }
    }

    return scoreElement;
}
function drawCell(parentElement, cell) {
    var cellElement = drawElement(parentElement, "cell");

    if (cell !== undefined) cellElement.dataset.color = cell;
}
function drawElement(parentElement, className) {
    var resultElement = document.createElement("div");

    if (parentElement) {
        parentElement.appendChild(resultElement);
    }

    if (className) {
        resultElement.className = className;
    }

    return resultElement;
}

function clearBoard() {
    var boardElement = document.querySelector(".board");

    if (boardElement) {
        boardElement.remove();
    }
}
