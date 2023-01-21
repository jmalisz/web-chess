import { useParams } from "@remix-run/react";
import { Chess } from "chess.js";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { NewChatMessageSchemaInput } from "~/api/createSocketIoServer.server";
// import sanitizeHtml from "sanitize-html";
import { GameChessboard } from "~/components/Chessboard";
import { useSocketIo } from "~/hooks/useSocketIo";

// function parseChatMessage(chatMessage: string) {
//   const lineBreak = "<br/>";

//   let letterCount = 0;

//   const chatMessageWithBreaks = chatMessage
//     .split(" ")
//     .map((word) => {
//       letterCount += word.length;

//       if (letterCount > 50) {
//         if (word.length > 50) return `${word.slice(0, 50)}${lineBreak}${word.slice(50)}`;

//         return `${word}<br/>`;
//       }

//       return word;
//     })
//     .join(" ");

//   return sanitizeHtml(chatMessageWithBreaks);
// }

export function GameRoute() {
  const { gameId } = useParams();
  if (!gameId) throw new Error("This shouldn't be matched by router");

  const socketIo = useSocketIo();

  const chatInputRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState(new Chess());

  const chatKeyUpHandler = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!socketIo) return;

      const { key, shiftKey } = event;
      if (key === "Enter" && !shiftKey) {
        event.preventDefault();

        if (!chatInputRef.current?.textContent) return;

        const newChatMessagePayload: NewChatMessageSchemaInput = {
          userId: "123",
          gameId,
          newChatMessage: chatInputRef.current.textContent,
        };
        socketIo.emit("newChatMessage", newChatMessagePayload);
      }
    },
    [gameId, socketIo]
  );

  return (
    <div className="flex h-4/5 gap-4">
      {/* Chessboard */}
      <GameChessboard game={game} side="white" onUndo={() => setGame(game)} />
      {/* Chat box */}
      <div className="flex w-80 flex-col gap-4">
        <div className="text-center">Game chat</div>
        <div className="flex grow flex-col gap-4 rounded-lg border border-base-content p-4">
          <div className="flex grow flex-col gap-2">
            <div className="chat chat-end">
              <div className="chat-bubble chat-bubble-primary">
                YouYouYouYouYouYouYouYouYouYouYouYouYouYouYouYouYouYouYouYouYou
              </div>
            </div>
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-secondary">Enemy</div>
            </div>
          </div>
          <div
            ref={chatInputRef}
            aria-label="Message input"
            className="input-bordered input h-24 max-h-24 overflow-auto"
            data-lexical-editor="true"
            role="textbox"
            spellCheck="true"
            tabIndex={0}
            contentEditable
            onKeyUp={chatKeyUpHandler}
          />
        </div>
      </div>
    </div>
  );
}

export default GameRoute;
