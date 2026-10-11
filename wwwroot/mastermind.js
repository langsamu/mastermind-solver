document.addEventListener("DOMContentLoaded", load);

const mapping = {
    "rowPushed": rowPushed,
    "thesis": thesis
};

let queue = [];
let slowMotion = false;

let w;
function workerMessage(e) {
    if (slowMotion) {
        queue.push(e.data);
    } else {
        mapping[e.data.name].apply(this, e.data.payload);
    }
}

let frame;
function process() {
    cancelAnimationFrame(frame);
    if (slowMotion) {
        frame = requestAnimationFrame(process);

        const message = queue.shift();
        if (message) {
            mapping[message.name].apply(this, message.payload);
        }

    }
}

function rowPushed(row) {
    if (candidateRow) {
        candidateRow.remove();
        candidateRow = undefined;
    } else { }

    drawRow(document.querySelector(".rows"), row);
}

let candidateRow;
function thesis(row) {
    if (candidateRow) {
        const cells = candidateRow.childNodes[0].childNodes;
        const pegs = candidateRow.childNodes[1].childNodes;
        for (let i = 0; i < rowLength; i++) {
            if (row.cells[i] === undefined) {
                delete cells[i].dataset.color;
            } else {
                cells[i].dataset.color = row.cells[i];
            }

            if (i < row.score.color) {
                pegs[i].className = "color";
            } else if (i - row.score.color < row.score.position) {
                pegs[i].className = "position";
            } else {
                pegs[i].className = "";
            }
        }
    } else {
        candidateRow = drawRow(document.querySelector(".rows"), row);
    }
}

function load() {
    initializeControls();
    //initializeGame();
}

const rowLength = 5;
const colorLength = 8;
function initializeControls() {
    document.getElementById("runButton").addEventListener("click", function () {
        initializeGame("solveConstructive");
    });
    document.getElementById("runLinearButton").addEventListener("click", function () {
        initializeGame("solveSerial");
    });
    document.getElementById("runRandomButton").addEventListener("click", function () {
        initializeGame("solveRandom");
    });

    document.getElementById("colorSelector").addEventListener("change", colorChanged);
    colorChanged();

    document.getElementById("layoutSelector").addEventListener("change", layoutChanged);
    layoutChanged();

    document.getElementById("slowMotionCheckbox").addEventListener("change", slowMotionChanged);
    slowMotionChanged();
}
function initializeGame(solver) {
    if (w) {
        w.terminate();
    }
    w = new Worker("worker.js");
    w.onmessage = workerMessage;

    process();
    clearBoard();
    queue = [];
    candidateRow = undefined;

    const solution = randomRow(rowLength, colorLength);
    //var solution = [1, 6, 0, 7, 6]; // Bence 20170123T2054
    //var solution = [6, 7, 3, 3, 2]; // Bence 20170130T1005
    //var solution = [7, 6, 5, 4, 3];
    //var solution = [0, 1, 2, 3, 4];
    //var solution = [3, 4, 5, 6, 7];
    //var solution = [7, 7, 7, 7, 6];

    const board = [];

    w.postMessage({ solver, solution, colorLength, rowLength });
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
    slowMotion = document.getElementById("slowMotionCheckbox").checked;
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
