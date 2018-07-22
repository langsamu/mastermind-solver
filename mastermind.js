window.addEventListener("load", load);

var colors = ["red", "green", "blue", "white", "black", "yellow", "brown", "orange"];
var solution = randomRow();
var board = randomBoard();

function load() {
    drawBoard(board);

    var boardElement = document.querySelector(".board");
    var solutionElement = element("solution");
    boardElement.insertBefore(solutionElement, boardElement.firstElementChild);

    drawRow(solutionElement, solution);

    var rows = document.querySelectorAll(".rows .row");
    rows.forEach(function (rowElement) {
        var rowScore = scoreRow(rowElement.row, solution);

        drawScore(rowElement, rowScore);
    });
}

function randomBoard() {
    var board = [];

    for (var i = 0; i < 50; i++) {
        var row = randomRow();

        board.push(row);
    }

    return board;
}

function randomRow() {
    var row = [];
    for (var i = 0; i < 5; i++) {
        var cell = Math.floor(Math.random() * colors.length);
        row.push(cell);
    }
    return row;
}

function drawScore(row, score) {
    var scoreElement = element("score", row);

    for (var i = 0; i < score.color; i++) {
        var positionElement = element("color", scoreElement);
    }

    for (var i = 0; i < score.position; i++) {
        var positionElement = element("position", scoreElement);
    }
}

function scoreRow(row, solution) {
    var correctColor = 0;
    var correctPosition = 0;
    var solutionClone = Array.from(solution);

    row.forEach(function (cell, i) {
        if (solutionClone[i] === cell) {
            solutionClone[i] = null;

            correctPosition++;
        }
    });

    row.forEach(function (cell) {
        if (solutionClone.indexOf(cell) !== -1) {
            solutionClone[solutionClone.indexOf(cell)] = null;

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
}

function drawRow(parent, row) {
    var rowElement = element("row", parent);
    rowElement.row = row;

    var cellsElement = element("cells", rowElement);

    row.forEach(function (cell) {
        var color = colors[cell];

        drawCell(cellsElement, color);
    });
}

function drawCell(rowElement, color) {
    var cellElement = element("cell", rowElement);
    cellElement.color = color;
    cellElement.style.backgroundColor = color;
}

function element(className, parent) {
    var result = document.createElement("div");

    if (parent) {
        parent.appendChild(result);
    }

    result.className = className;

    return result;
}