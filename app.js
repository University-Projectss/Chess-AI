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

let positionsCount;

let board = null;
let game = new Chess();
let depthSelector = document.getElementById("depthSelector");

depthSelector.addEventListener("change", (e) => {
  depth = e.target.value;
});

let whiteSquareGrey = "#a9a9a9";
let blackSquareGrey = "#696969";

let weights = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
  K: 999,
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

  for (let move of moves) {
    game.ugly_move(move);
    let boardValue = minimax(game, depth, false, -Infinity, Infinity);
    // console.log(boardValue);
    game.undo();

    if (boardValue >= bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  console.log("Positions evaluated: ", positionsCount);

  return bestMove;
};

const minimax = (game, depth, isMaximizing, alpha, beta) => {
  positionsCount += 1;
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

      if (beta <= alpha) break;
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

      if (beta <= alpha) break;
    }
    return bestScore;
  }
};

const evaluateBoard = (board) => {
  let eval = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      eval += getPieceValue(board[i][j]);
    }
  }

  return eval;
};

const getPieceValue = (piece) => {
  if (piece === null) return 0;

  if (piece.color === "w") return weights[piece.type.toUpperCase()];
  else return -weights[piece.type.toUpperCase()];
};

//winning some material
const makeBetterMove = () => {
  if (game.game_over()) return;

  let move = getBestMove();
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
