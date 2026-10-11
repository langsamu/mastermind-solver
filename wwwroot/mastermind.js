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
        const a = fake.childNodes[0].childNodes;
        const b = fake.childNodes[1].childNodes;
        for (let i = 0; i < rowLength; i++) {
            if (row.cells[i] === undefined) {
                delete a[i].dataset.color;
            } else {
                a[i].dataset.color = row.cells[i];
            }

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

const rowLength = 5;
const colorLength = 8;
function initializeControls() {
    document.getElementById("runButton").addEventListener("click", initializeGame);

    document.getElementById("colorSelector").addEventListener("change", colorChanged);
    colorChanged();

    document.getElementById("layoutSelector").addEventListener("change", layoutChanged);
    layoutChanged();

    document.getElementById("slowMotionCheckbox").addEventListener("change", slowMotionChanged);
    slowMotionChanged();
}
function initializeGame() {
    process();
    clearBoard();
    queue = [];

    const solution = randomRow(rowLength, colorLength);
    //var solution = [1, 6, 0, 7, 6]; // Bence 20170123T2054
    //var solution = [6, 7, 3, 3, 2]; // Bence 20170130T1005
    //var solution = [7, 6, 5, 4, 3];
    //var solution = [0, 1, 2, 3, 4];
    //var solution = [3, 4, 5, 6, 7];
    //var solution = [7, 7, 7, 7, 6];

    const board = [];

    w.postMessage({
        name: "solveConstructive",
        payload: [board, solution, colorLength, rowLength]
    });
    //solveConstructive(board, solution, colorLength, rowLength);

    const gameElement = document.getElementById("game");
    const boardElement = drawBoard(gameElement, board);

    const solutionElement = drawElement(null, "solution");
    boardElement.insertBefore(solutionElement, boardElement.firstElementChild);

    drawRow(solutionElement, { cells: solution });

    //solveSerial(board, solution, colorLength, rowLength);
    //solveRandom(board, solution, colorLength, rowLength);
}

function colorChanged() {
    document.body.dataset.color = document.getElementById("colorSelector").value;
}
function layoutChanged() {
    document.body.dataset.layout = document.getElementById("layoutSelector").value;
}
function slowMotionChanged() {
    document.body.dataset.x = document.getElementById("slowMotionCheckbox").checked;
}

function solveSerial(board, solution, colorLength, rowLength) {
    const max = Math.pow(colorLength, rowLength);

    for (let rowNumber = 0; rowNumber < max; rowNumber++) {
        const row = numberedRow(rowNumber, rowLength, colorLength);

        const rowScore = createAndScore(board, row, solution);

        if (rowScore.position === rowLength) {
            break;
        }
    }
}
function solveRandom(board, solution, colorLength, rowLength) {
    let done = false;
    while (!done) {
        const row = randomRow(rowLength, colorLength);

        const rowScore = createAndScore(board, row, solution);

        done = rowScore.position === rowLength;
    }
}



function numberedRow(i, length, base) {
    const numberString = i.toString(base);
    const padded = padLeft(numberString, length, "0");
    const stringArray = padded.split("");

    return stringArray.map(function (character) {
        return parseInt(character, base);
    });
}
function padLeft(original, targetLength, padString) {
    const arrayOfLength = new Array(targetLength + 1);
    const stringOfLength = arrayOfLength.join(padString);
    const tooLongString = stringOfLength + original;

    return tooLongString.slice(-targetLength)
}

function randomBoard(length, rowLength, colorLength) {
    const board = [];

    for (let i = 0; i < length; i++) {
        const row = randomRow(rowLength, colorLength);

        board.push(row);
    }

    return board;
}
function randomRow(length, colorLength) {
    const row = [];

    for (let i = 0; i < length; i++) {
        const cell = randomCell(colorLength);

        row.push(cell);
    }

    return row;
}
function randomCell(length) {
    return Math.floor(Math.random() * length);
}

function drawBoard(parentElement, board) {
    const boardElement = drawElement(parentElement, "board");
    const rowsElement = drawElement(boardElement, "rows");

    board.forEach(function (row) {
        drawRow(rowsElement, row);
    });

    return boardElement;
}
function drawRow(parentElement, row) {
    const rowElement = drawElement(parentElement, "row");
    const cellsElement = drawElement(rowElement, "cells");

    for (let i = 0; i < rowLength; i++) {
        drawCell(cellsElement, row.cells[i]);
    }

    if (row.score) {
        drawScore(rowElement, row.score);
    }

    return rowElement;
}
function drawScore(parentElement, score) {
    const scoreElement = drawElement(parentElement, "score");

    for (let i = 0; i < rowLength; i++) {
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
    const cellElement = drawElement(parentElement, "cell");

    if (cell !== undefined) cellElement.dataset.color = cell;
}
function drawElement(parentElement, className) {
    const resultElement = document.createElement("div");

    if (parentElement) {
        parentElement.appendChild(resultElement);
    }

    if (className) {
        resultElement.className = className;
    }

    return resultElement;
}

function clearBoard() {
    const boardElement = document.querySelector(".board");

    if (boardElement) {
        boardElement.remove();
    }
}
