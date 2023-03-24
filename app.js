/**
 *
 * I will play white, an the AI will play black
 *
 * At this moment the AI can play minimax
 *
 * Use the variable depth to adjust the minimax tree depth
 *
 */
let depth = 1;

let positionsCount, positionsCountBad;

let board = null;
let game = new Chess();
let depthSelector = document.getElementById("depthSelector");
let movesCount = document.getElementById("movesCount");
let movesTime = document.getElementById("movesTime");

depthSelector.addEventListener("change", (e) => {
  depth = e.target.value;
});

let whiteSquareGrey = "#a9a9a9";
let blackSquareGrey = "#696969";

let weights = {
  P: 100,
  N: 280,
  B: 320,
  R: 479,
  Q: 929,
  K: 60000,
};

//Piece Square Table
//The value of a piece, based on its position on the table
let pstWhite = {
  P: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  N: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  B: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  R: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  Q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  K: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],
};

let pstBlack = {
  P: pstWhite.P.slice().reverse(),
  N: pstWhite.N.slice().reverse(),
  B: pstWhite.B.slice().reverse(),
  R: pstWhite.R.slice().reverse(),
  Q: pstWhite.Q.slice().reverse(),
  K: pstWhite.K.slice().reverse(),
};

/**
 *
 * AI LOGIC WITH MINIMAX
 *
 */

const getBestMove = () => {
  let moves = game.ugly_moves();
  let bestMove = null;
  let bestValue = -Infinity;
  positionsCount = 0;
  positionsCountBad = 0;

  for (let move of moves) {
    game.ugly_move(move);
    let boardValue = minimax(game, depth, false, -Infinity, Infinity);
    // let boardValue = minimaxBad(game, depth, false);
    game.undo();

    if (boardValue >= bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  // console.log("Minimax + alpha beta pruning: ", positionsCount);
  movesCount.innerHTML = positionsCount;
  // console.log("Minimax: ", positionsCountBad);

  return bestMove;
};

const minimax = (game, depth, isMaximizing, alpha, beta) => {
  positionsCount++;
  if (depth <= 1) {
    //- because the black score is negative, and this way we make it > 0
    return -evaluateBoard(game.board());
  }

  let moves = game.ugly_moves();

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let move of moves) {
      game.ugly_move(move);
      bestScore = Math.max(
        bestScore,
        minimax(game, depth - 1, !isMaximizing, alpha, beta)
      );
      game.undo();

      alpha = Math.max(alpha, bestScore);

      if (beta <= alpha) return bestScore;
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      game.ugly_move(move);
      bestScore = Math.min(
        bestScore,
        minimax(game, depth - 1, !isMaximizing, alpha, beta)
      );
      game.undo();

      beta = Math.min(beta, bestScore);

      if (beta <= alpha) return bestScore;
    }
    return bestScore;
  }
};

const minimaxBad = (game, depth, isMaximizing) => {
  positionsCountBad++;
  if (depth <= 1) {
    //- because the black score is negative, and this way we make it > 0
    return -evaluateBoard(game.board());
  }

  let moves = game.ugly_moves();

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let move of moves) {
      game.ugly_move(move);
      bestScore = Math.max(
        bestScore,
        minimaxBad(game, depth - 1, !isMaximizing)
      );
      game.undo();
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let move of moves) {
      game.ugly_move(move);
      bestScore = Math.min(
        bestScore,
        minimaxBad(game, depth - 1, !isMaximizing)
      );
      game.undo();
    }
    return bestScore;
  }
};

const evaluateBoard = (board) => {
  let eval = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      eval += getPieceValue(board[i][j], i, j);
    }
  }

  return eval;
};

const getPieceValue = (piece, i, j) => {
  if (piece === null) return 0;

  if (piece.color === "w")
    return (
      weights[piece.type.toUpperCase()] +
      pstWhite[piece.type.toUpperCase()][i][j]
    );
  else
    return (
      -1 *
      (weights[piece.type.toUpperCase()] +
        pstBlack[piece.type.toUpperCase()][i][j])
    );
};

const makeBetterMove = () => {
  if (game.game_over()) return;

  const t1 = new Date().getTime();
  let move = getBestMove();
  const t2 = new Date().getTime();

  movesTime.innerHTML = (t2 - t1) / 1000;

  // console.log(move);
  game.ugly_move(move);
  board.position(game.fen());
};

/**
 *
 * BOARD ACTIONS
 *
 */

const removeGreySquares = () => {
  $("#board .square-55d63").css("background", "");
};

const greySquare = (square) => {
  var $square = $("#board .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
};

const onMouseoverSquare = (square, piece) => {
  //square: h1, piece: wP
  // get list of possible moves for this square
  let moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  //highlight the current square
  greySquare(square);

  // highlight the possible squares for this piece
  for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

const onMouseoutSquare = (square, piece) => {
  removeGreySquares();
};

const onDragStart = (source, piece) => {
  //check if is game over first
  if (game.game_over()) return false;

  //check if its my turn
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
};

const onDrop = (source, target) => {
  removeGreySquares();

  //check if it's a legal move
  const move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (move === null) return "snapback";
};

const onSnapEnd = () => {
  board.position(game.fen());
  setTimeout(makeBetterMove, 100);
};

/**
 *
 * BOARD CONFIG
 *
 */

let config = {
  position: "start",
  draggable: true,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};
board = Chessboard("board", config);
