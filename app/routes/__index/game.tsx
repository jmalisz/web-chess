import { Chess } from "chess.js";
import { useState } from "react";

import { GameChessboard } from "~/components/Chessboard";

export function GameRoute() {
  const [game, setGame] = useState(new Chess());

  return (
    <div
      className={`grid h-full grid-cols-3  gap-10 [grid-template-areas:'chessboard_chessboard_chat''goBack_goBack_goBack'] [grid-template-rows:70%_1fr]`}
    >
      {/* Chessboard */}
      <div className="pt-10 [grid-area:chessboard]">
        <GameChessboard game={game} side="white" onUndo={() => setGame(game)} />
      </div>
      {/* Chat box */}
      <div className="flex flex-col gap-4 [grid-area:chat]">
        <div className="text-center">Game chat</div>
        <div className="flex grow flex-col gap-4 rounded-lg border border-gray-200 p-4">
          <div className="flex grow flex-col gap-2">
            <div className="peer mr-auto rounded-lg bg-red-200 p-2">Enemy</div>
            <div className="ml-auto rounded-lg bg-blue-200 p-2 peer-[.bg-red-200]:-mt-1">You</div>
          </div>
          <textarea
            className="resize-none rounded-lg bg-gray-100"
            placeholder="Write a message..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

export default GameRoute;
