window.addEventListener("load", load);

var colors = ["red", "green", "blue", "white", "black", "yellow", "brown", "orange"];
var rowLength = 4;
var colorLength = 4;
var solution = randomRow(rowLength,colorLength);
var board = [];

function load() {
    var boardElement = drawBoard(board);

    var solutionElement = element("solution");
    boardElement.insertBefore(solutionElement, boardElement.firstElementChild);

    drawRow(solutionElement, solution);

    var max = Math.pow(colorLength, rowLength);
    for (var i = 0; i < max; i++) {
        var row = numberedRow(i, rowLength, colorLength);
        board.push(row);

        var rowsElement = document.querySelector(".rows");
        var rowElement = drawRow(rowsElement, row);
        var rowScore = scoreRow(row, solution);

        drawScore(rowElement, rowScore);

        if (rowScore.position === rowLength) {
            break;
        }
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

    return boardElement;
}

function drawRow(parent, row) {
    var rowElement = element("row", parent);
    rowElement.row = row;

    var cellsElement = element("cells", rowElement);

    row.forEach(function (cell) {
        var color = colors[cell];

        drawCell(cellsElement, color);
    });

    return rowElement;
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