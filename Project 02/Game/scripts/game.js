// initialization
var gameData = {
    cells: [],
    board: null,
    title: null,
    turnStatus: null,
    startButton: null,
    playerPieceStatus: null,
    playerPieceIndex: 0,
    playerTurn: true,
    opponentIsCPU: false,
    gamePieces: ["x", "o"],
    placedPieces: 0,
    playing: false,
    playerWon: false,
    stalemate: true
}

window.onload = function() {
    gameData.cells = document.querySelectorAll(".cell");
    gameData.board = document.querySelector(".board");
    gameData.turnStatus = document.querySelector(".turnStatus");
    gameData.playerPieceStatus = document.querySelector(".playerPieceStatus");
    gameData.startButton = document.querySelector("#startGame");
    
    resetBoard();
}
//

// start & restart
function startGame() {
    let opponentType = document.querySelector('input[name="opponentType"]:checked').value;
    if (opponentType === "cpu")
        gameData.opponentIsCPU = true;

    selectStartingPlayer();
    updateStatus();
    gameData.playerPieceStatus.textContent = "The player's piece is [" + getPlayerPiece() + "]";
    gameData.playing = true;
    gameData.startButton.disabled = true;

    if (gameData.opponentIsCPU && !gameData.playerTurn)
        cpuPlayPiece();
}

function resetBoard() {
    gameData.cells.forEach(cell => {
        cell.textContent = "";
    });

    gameData.turnStatus.textContent = "No game in progress.";
    gameData.playerPieceStatus.textContent = "Please select an opponent type and click the 'Start' button below!";
    gameData.placedPieces = 0;
    gameData.playerWon = false;
    gameData.stalemate = true;
    gameData.playing = false;
    gameData.opponentIsCPU = false;

    gameData.startButton.disabled = false;
}
//

// player interaction
function placePiece(row, col)  {
    let index = row + (col * 3)

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
function sleep(timeMs) {
    return new Promise(resolve => setTimeout(resolve, timeMs));
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
    return gameData.cells[index].textContent != ""
}

function updateStatus() {
    let status = "";
    if (gameData.playerTurn)
        status = "player's"
    else 
        status = gameData.opponentIsCPU ? "CPU's" : "opponent's";

    gameData.turnStatus.textContent = "It's the " + status + " turn.";
}

function cpuPlayPiece() {
    sleep(500 + Math.random() * 500)
        .then(() => cpuOccupyCell());
}

function endGame() {
    gameData.playing = false;

    gameData.playerPieceStatus.textContent = "Game over, ";

    if (gameData.playerWon)
        gameData.playerPieceStatus.textContent += "you've ";
    else if (!gameData.stalemate)
        gameData.playerPieceStatus.textContent += "your opponent ";
    else
        gameData.playerPieceStatus.textContent += "nobody ";

    gameData.playerPieceStatus.textContent += "won!"
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

function occupyCell(cellIndex) {
    let cell = gameData.cells[cellIndex]

    let piece = gameData.playerTurn ? getPlayerPiece() : getOpponentPiece();
    cell.textContent = piece;
    gameData.placedPieces++;


    checkBoard();

    if (gameData.placedPieces >= gameData.cells.length) {
        endGame();
        return;
    }

    gameData.playerTurn = !gameData.playerTurn;
}

function checkBoard() {
    let pieceToCheck = gameData.playerTurn ? getPlayerPiece() : getOpponentPiece();
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            let index = row + (col * 3);
            console.log(gameData.cells[index] === pieceToCheck);
        }
    }
}
//