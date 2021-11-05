// initialization
'use strict';

var gameData = {
    cells: [],
    board: null,

    title: null,
    turnStatus: null,
    playerPieceStatus: null,
    gameTimerStatus: null,

    startButton: null,
    playAgainButton: null,

    playerPieceIndex: 0,
    playerTurn: true,
    opponentIsCPU: false,
    gamePieces: ["x", "o"],
    placedPieces: 0,

    playing: false,
    playerWon: false,
    stalemate: true,

    gameTimerInterval: -1,
    gameStartTime: 0,
}

window.onload = function () {
    gameData.cells = document.querySelectorAll(".cell");
    gameData.board = document.querySelector(".board");
    gameData.turnStatus = document.querySelector(".turnStatus");
    gameData.playerPieceStatus = document.querySelector(".playerPieceStatus");
    gameData.gameTimerStatus = document.querySelector("#gameTime");
    gameData.startButton = document.querySelector("#startGame");
    gameData.playAgainButton = document.querySelector("#playAgain");

    resetBoard();
}

//

// start & restart
function startGame() {
    resetBoard();

    let opponentType = document.querySelector('input[name="opponentType"]:checked').value;
    if (opponentType === "cpu")
        gameData.opponentIsCPU = true;

    gameData.gameTimerInterval = setInterval(updateGameTime, 1000);
    gameData.gameStartTime = Date.now();
    selectStartingPlayer();
    updateStatus();
    gameData.playerPieceStatus.textContent = "The player's piece is [" + getPlayerPiece() + "]";
    gameData.playing = true;

    gameData.board.classList.add("playable");

    if (gameData.opponentIsCPU && !gameData.playerTurn)
        cpuPlayPiece();
}

function resetBoard() {
    gameData.playAgainButton.disabled = true;

    gameData.cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winLine");
    });

    gameData.turnStatus.textContent = "No game in progress.";
    gameData.playerPieceStatus.textContent = "Please select an opponent type and click the 'Start' button below!";
    gameData.placedPieces = 0;
    gameData.playerWon = false;
    gameData.stalemate = true;
    gameData.playing = false;
    gameData.opponentIsCPU = false;

    clearInterval(gameData.gameTimerInterval);
    gameData.gameStartTime = 0;

    gameData.board.classList.remove("playable");
}
//

// player board interaction
function placePiece(col, row) {
    let index = col + (row * 3)

    if ((gameData.opponentIsCPU && !gameData.playerTurn) || !gameData.playing || cellIsOccupied(index))
        return;

    occupyCell(index);
    updateStatus();

    if (!gameData.playing)
        return;

    if (gameData.opponentIsCPU && gameData.playing)
        cpuPlayPiece();
}
//

// light logic
function sleep(milliSeconds) {
    // Let's use setTimeout() wrapped in a Promise :)
    // It's cleaner to use the .then() structure I think.
    return new Promise(resolve => setTimeout(resolve, milliSeconds));
}

function selectStartingPlayer() {
    gameData.playerTurn = !Math.floor(Math.random() * 2);
}

function getPlayerPiece() {
    return gameData.gamePieces[0];
}

function getOpponentPiece() {
    return gameData.gamePieces[1];
}

function cellIsOccupied(index) {
    return getCellPiece(index) != ""
}

function getCellPiece(index) {
    return gameData.cells[index].textContent;
}

function updateStatus() {
    let status = "";
    let piece = gameData.playerTurn ? getPlayerPiece() : getOpponentPiece();

    if (gameData.playerTurn)
        status = "player's"
    else
        status = gameData.opponentIsCPU ? "CPU's" : "opponent's";

    gameData.turnStatus.textContent = "It's the " + status + " turn. [" + piece + "]";
}

function updateGameTime() {
    let curSeconds = Math.floor((Date.now() - gameData.gameStartTime)/ 1000).toString().padStart(2, "0");
    let curMins = Math.floor(curSeconds / 60).toString().padStart(2, "0");
    let curHours = Math.floor(curMins / 60).toString().padStart(2, "0");
    gameData.gameTimerStatus.textContent = curHours + ":" + curMins + ":" + curSeconds + "s";
}

function cpuPlayPiece() {
    sleep(500 + Math.random() * 500)
        .then(() => cpuOccupyCell());
}

function endGame() {
    gameData.playing = false;
    gameData.playAgainButton.disabled = false;
    gameData.board.classList.remove("playable");
    
    clearInterval(gameData.gameTimerInterval);

    gameData.playerPieceStatus.textContent = "Game over, ";

    if (gameData.playerWon)
        gameData.playerPieceStatus.textContent += "you've ";
    else if (!gameData.stalemate)
        gameData.playerPieceStatus.textContent += "your opponent ";
    else
        gameData.playerPieceStatus.textContent += "nobody ";

    gameData.playerPieceStatus.textContent += "won!"

}

function mod(num, m) {
    return ((num % m) + m) % m;
}
//

// heavy logic
function cpuOccupyCell() {
    let index = 0;
    let panic = 1000;

    do {
        index = Math.floor(Math.random() * gameData.cells.length);
        panic--;
    } while (cellIsOccupied(index) || !panic);

    if (!panic) {
        alert("Panic!");
        return;
    }

    occupyCell(index);
    updateStatus();
}

function occupyCell(index) {
    let cell = gameData.cells[index]

    let piece = gameData.playerTurn ? getPlayerPiece() : getOpponentPiece();
    cell.textContent = piece;
    gameData.placedPieces++;

    if (checkBoard(index))
        return;

    gameData.playerTurn = !gameData.playerTurn;
}

function checkBoard(originIndex) {
    console.log("----------------------")
    console.log(originIndex);

    if (processLine(originIndex, 1, 0)) {
        endGame();
        return true;
    }

    if (processLine(originIndex, 0, 1)) {
        endGame();
        return true;
    }

    if (processLine(0, 1, 1, true)) {
        endGame();
        return true;
    }

    if (processLine(6, 1, -1, true)) {
        endGame();
        return true;
    }

    console.log("----------------------\n")

    if (gameData.placedPieces >= gameData.cells.length) {
        endGame();
        return true;
    }

    return false;
}

function processLine(originIndex, rowIncrement, colIncrement, debug) {
    let pieceToCheck = gameData.playerTurn ? getPlayerPiece() : getOpponentPiece();

    let cRow = Math.floor(originIndex / 3);
    let cCol = mod(originIndex, 3);
    let index = 0;

    let matches = [];
    for (let i = 0; i < 3; i++) {
        index = cCol + (cRow * 3)

        if (debug) {
            console.log(cRow, cCol);
            console.log(getCellPiece(index))
        }

        if (getCellPiece(index) != pieceToCheck)
            break;

        matches.push(gameData.cells[index]);

        cRow += rowIncrement;
        cRow = mod(cRow, 3);

        cCol += colIncrement;
        cCol = mod(cCol, 3);
    }

    if (matches.length >= 3) {
        gameData.playing = false;
        gameData.stalemate = false;

        if (gameData.playerTurn)
            gameData.playerWon = true;

        matches.forEach(match => {
            match.classList.add("winLine");
        });

        return true;
    }

    return false;
}
//