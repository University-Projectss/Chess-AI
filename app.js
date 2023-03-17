let board = null;
let game = new Chess();

let whiteSquareGrey = "#a9a9a9";
let blackSquareGrey = "#696969";

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

const makeRandomMove = () => {
  let possibleMoves = game.moves();

  // exit if the game is over
  if (game.game_over()) return;

  let randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen());
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
  makeRandomMove();
};

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
