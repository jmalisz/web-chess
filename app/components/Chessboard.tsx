import type { Chess, Square } from "chess.js";
import { useCallback, useState } from "react";
import { Chessboard } from "react-chessboard";

type PossibleMovesType = Record<string, { background?: string; borderRadius?: string }>;

type GameChessboardProps = {
  game: Chess;
  side: "white" | "black";
  // onFinish?: () => void;
  onMove?: (position: string) => void;
  onSurrender?: () => void;
  onUndo?: () => void;
};

export function GameChessboard({
  game,
  side,
  // onFinish,
  onMove,
  onSurrender,
  onUndo,
}: GameChessboardProps) {
  // Updating position is necessary to facilitate component rerendering
  const [position, setPosition] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [possibleMoves, setPossibleMoves] = useState<PossibleMovesType>();

  const deselectPiece = useCallback(() => {
    setMoveFrom("");
    setPossibleMoves(undefined);
  }, []);

  const onSquareClick = useCallback(
    (square: Square) => {
      // function makeRandomMove() {
      //   const possibleRandomMove = game.moves();

      //   // exit if the game is over
      //   if (game.isGameOver() || game.isDraw() || possibleRandomMove.length === 0) return;

      //   const randomIndex = Math.floor(Math.random() * possibleRandomMove.length);
      //   game.move(possibleRandomMove[randomIndex]);
      //   setPosition(game.fen());
      // }

      function getPossibleMoves(selectedPiece: Square) {
        const moves = game.moves({
          square: selectedPiece,
          verbose: true,
        });
        if (moves.length === 0) {
          return;
        }

        // Mark squares where selectedPiece can move
        const newPossibleMoves: PossibleMovesType = Object.fromEntries(
          moves.map(({ to, captured, promotion }) => [
            to,
            {
              background:
                captured || promotion
                  ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                  : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
              borderRadius: "50%",
            },
          ])
        );
        // Mark the selected piece
        newPossibleMoves[square] = {
          background: "rgba(255, 255, 0, 0.4)",
        };

        return newPossibleMoves;
      }

      if (square === moveFrom) {
        deselectPiece();

        return;
      }

      const squareInformation = game.get(square);
      if (squareInformation.color === side[0]) {
        setMoveFrom(square);
        setPossibleMoves(getPossibleMoves(square));

        return;
      }

      // Deselect piece on clicking empty square that isn't a possible move
      if (!possibleMoves?.[square]) {
        deselectPiece();

        return;
      }

      // Perform a move
      game.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });
      const newPosition = game.fen();
      setMoveFrom("");
      setPossibleMoves(undefined);
      setPosition(newPosition);
      onMove?.(newPosition);
      // setTimeout(makeRandomMove, 300);
    },
    [moveFrom, game, side, possibleMoves, onMove, deselectPiece]
  );

  return (
    <div>
      <Chessboard
        arePiecesDraggable={false}
        boardOrientation={side}
        customSquareStyles={possibleMoves}
        position={position}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          marginBottom: 16,
        }}
        onSquareClick={onSquareClick}
      />
      <div className="flex gap-2">
        <button
          className="btn-outline btn"
          type="button"
          onClick={() => {
            game.reset();
            deselectPiece();
            setPosition(game.fen());
            onSurrender?.();
          }}
        >
          Surrender
        </button>
        <button
          className="btn-outline btn"
          type="button"
          onClick={() => {
            game.undo();
            deselectPiece();
            setPosition(game.fen());
            onUndo?.();
          }}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
