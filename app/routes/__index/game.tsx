import { Chess } from "chess.js";
import { useState } from "react";

import { GameChessboard } from "~/components/Chessboard";

export function GameRoute() {
  const [game, setGame] = useState(new Chess());

  return (
    <div className="flex h-4/5 gap-4">
      {/* Chessboard */}
      <div className="flex grow flex-col gap-4">
        <div className="text-center">Game in session...</div>
        <GameChessboard game={game} side="white" onUndo={() => setGame(game)} />
      </div>
      {/* Chat box */}
      <div className="flex w-80 flex-col gap-4">
        <div className="text-center">Game chat</div>
        <div className="flex grow flex-col gap-4 rounded-lg border border-base-content p-4">
          <div className="flex grow flex-col gap-2">
            <div className="chat chat-end">
              <div className="chat-bubble chat-bubble-primary">You</div>
            </div>
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-secondary">Enemy</div>
            </div>
          </div>
          <input className="input-bordered input" placeholder="Write a message..." type="text" />
        </div>
      </div>
    </div>
  );
}

export default GameRoute;
