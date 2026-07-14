"use strict";

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const BOARD_SIZE = 8;

const DIRECTIONS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
];

let board = [];
let currentPlayer = BLACK;
let gameOver = false;

const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");
const homeButton = document.getElementById("home-button");
const restartButton = document.getElementById("restart-button");

const boardElement = document.getElementById("board");
const turnDisplay = document.getElementById("turn-display");
const turnPiece = document.getElementById("turn-piece");

const blackScoreElement = document.getElementById("black-score");
const whiteScoreElement = document.getElementById("white-score");
const messageElement = document.getElementById("message");

const resultModal = document.getElementById("result-modal");
const resultTitle = document.getElementById("result-title");
const resultScore = document.getElementById("result-score");

const playAgainButton = document.getElementById("play-again-button");
const modalHomeButton = document.getElementById("modal-home-button");

function createEmptyBoard() {
    return Array.from(
        { length: BOARD_SIZE },
        () => Array(BOARD_SIZE).fill(EMPTY)
    );
}

function initializeGame() {
    board = createEmptyBoard();

    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;

    currentPlayer = BLACK;
    gameOver = false;

    resultModal.classList.add("hidden");
    messageElement.textContent = "Black moves first.";

    renderGame();
}

function showGameScreen() {
    welcomeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    initializeGame();
}

function showWelcomeScreen() {
    resultModal.classList.add("hidden");
    gameScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
}

function isInsideBoard(row, col) {
    return (
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
    );
}

function opponentOf(player) {
    return player === BLACK ? WHITE : BLACK;
}

function playerName(player) {
    return player === BLACK ? "Black" : "White";
}

function getFlipsInDirection(
    row,
    col,
    rowStep,
    colStep,
    player
) {
    const opponent = opponentOf(player);
    const flips = [];

    let currentRow = row + rowStep;
    let currentCol = col + colStep;

    while (
        isInsideBoard(currentRow, currentCol) &&
        board[currentRow][currentCol] === opponent
    ) {
        flips.push([currentRow, currentCol]);

        currentRow += rowStep;
        currentCol += colStep;
    }

    const endsWithPlayerPiece =
        isInsideBoard(currentRow, currentCol) &&
        board[currentRow][currentCol] === player;

    if (flips.length > 0 && endsWithPlayerPiece) {
        return flips;
    }

    return [];
}

function getFlips(row, col, player) {
    if (!isInsideBoard(row, col)) {
        return [];
    }

    if (board[row][col] !== EMPTY) {
        return [];
    }

    const allFlips = [];

    for (const [rowStep, colStep] of DIRECTIONS) {
        const directionFlips = getFlipsInDirection(
            row,
            col,
            rowStep,
            colStep,
            player
        );

        allFlips.push(...directionFlips);
    }

    return allFlips;
}

function getValidMoves(player) {
    const moves = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            if (getFlips(row, col, player).length > 0) {
                moves.push([row, col]);
            }
        }
    }

    return moves;
}

function playMove(row, col) {
    if (gameOver) {
        return;
    }

    const flips = getFlips(row, col, currentPlayer);

    if (flips.length === 0) {
        messageElement.textContent =
            "Invalid move. Choose a highlighted square.";

        return;
    }

    board[row][col] = currentPlayer;

    for (const [flipRow, flipCol] of flips) {
        board[flipRow][flipCol] = currentPlayer;
    }

    const previousPlayer = currentPlayer;
    const nextPlayer = opponentOf(currentPlayer);

    if (getValidMoves(nextPlayer).length > 0) {
        currentPlayer = nextPlayer;

        messageElement.textContent =
            `${playerName(currentPlayer)}'s turn.`;
    } else if (getValidMoves(previousPlayer).length > 0) {
        currentPlayer = previousPlayer;

        messageElement.textContent =
            `${playerName(nextPlayer)} has no valid moves. ` +
            `${playerName(previousPlayer)} plays again.`;
    } else {
        finishGame();
    }

    renderGame();
}

function countPieces(player) {
    let count = 0;

    for (const row of board) {
        for (const cell of row) {
            if (cell === player) {
                count += 1;
            }
        }
    }

    return count;
}

function finishGame() {
    gameOver = true;

    const blackScore = countPieces(BLACK);
    const whiteScore = countPieces(WHITE);

    if (blackScore > whiteScore) {
        resultTitle.textContent = "Black Wins!";
    } else if (whiteScore > blackScore) {
        resultTitle.textContent = "White Wins!";
    } else {
        resultTitle.textContent = "It's a Draw!";
    }

    resultScore.textContent =
        `Black ${blackScore} — ${whiteScore} White`;

    messageElement.textContent = "Game over.";

    resultModal.classList.remove("hidden");
}

function createPiece(pieceValue) {
    const pieceElement = document.createElement("div");

    pieceElement.classList.add("piece");

    if (pieceValue === BLACK) {
        pieceElement.classList.add("black");
    } else {
        pieceElement.classList.add("white");
    }

    return pieceElement;
}

function renderBoard() {
    boardElement.replaceChildren();

    const validMoves = gameOver
        ? []
        : getValidMoves(currentPlayer);

    const validMoveKeys = new Set(
        validMoves.map(([row, col]) => `${row},${col}`)
    );

    for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
            const cellElement = document.createElement("button");

            cellElement.type = "button";
            cellElement.classList.add("cell");

            cellElement.setAttribute(
                "aria-label",
                `Row ${row + 1}, column ${col + 1}`
            );

            cellElement.addEventListener("click", () => {
                playMove(row, col);
            });

            const pieceValue = board[row][col];

            if (pieceValue !== EMPTY) {
                cellElement.appendChild(createPiece(pieceValue));
            } else if (validMoveKeys.has(`${row},${col}`)) {
                cellElement.classList.add("valid-move");
            }

            boardElement.appendChild(cellElement);
        }
    }
}

function renderStatus() {
    blackScoreElement.textContent =
        String(countPieces(BLACK));

    whiteScoreElement.textContent =
        String(countPieces(WHITE));

    turnDisplay.textContent =
        gameOver ? "Finished" : playerName(currentPlayer);

    turnPiece.classList.remove(
        "black-mini",
        "white-mini"
    );

    if (currentPlayer === BLACK) {
        turnPiece.classList.add("black-mini");
    } else {
        turnPiece.classList.add("white-mini");
    }
}

function renderGame() {
    renderBoard();
    renderStatus();
}

startButton.addEventListener("click", showGameScreen);

homeButton.addEventListener("click", showWelcomeScreen);

restartButton.addEventListener("click", initializeGame);

playAgainButton.addEventListener("click", initializeGame);

modalHomeButton.addEventListener(
    "click",
    showWelcomeScreen
);
