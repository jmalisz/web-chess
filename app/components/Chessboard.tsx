import type { Chess, Square } from "chess.js";
import { useCallback, useState } from "react";
import { Chessboard } from "react-chessboard";

type PossibleMovesType = Record<string, { background?: string; borderRadius?: string }>;

type GameChessboardProps = {
  game: Chess;
  side: "white" | "black";
  onMove: (from: string, to: string) => void;
  onSurrender: () => void;
  onUndo: () => void;
};

export function GameChessboard({ game, side, onMove, onSurrender, onUndo }: GameChessboardProps) {
  const [moveFrom, setMoveFrom] = useState("");
  const [possibleMoves, setPossibleMoves] = useState<PossibleMovesType>();

  const deselectPiece = useCallback(() => {
    setMoveFrom("");
    setPossibleMoves(undefined);
  }, []);

  const onSquareClick = useCallback(
    (square: Square) => {
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
      onMove(moveFrom, square);
      setMoveFrom("");
      setPossibleMoves(undefined);
    },
    [moveFrom, game, side, possibleMoves, onMove, deselectPiece]
  );

  const getGameHeader = useCallback(() => {
    if (game.isCheck()) return game.turn() === "w" ? "White in check!" : "Black in check!";

    return "Game is in session...";
  }, [game]);

  // A lot of things are rerendered when new game prop will arrive
  return (
    <div className="flex grow flex-col gap-4">
      <div className="text-center">{getGameHeader()}</div>
      <div>
        <Chessboard
          arePiecesDraggable={false}
          boardOrientation={side}
          customSquareStyles={possibleMoves}
          position={game.fen()}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            marginBottom: 16,
          }}
          onSquareClick={onSquareClick}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="btn-outline btn"
          type="button"
          onClick={() => {
            deselectPiece();
            onSurrender();
          }}
        >
          Surrender
        </button>
        <button
          className="btn-outline btn"
          disabled={game.turn() === side[0] || game.pgn().length === 0}
          type="button"
          onClick={() => {
            deselectPiece();
            onUndo();
          }}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
