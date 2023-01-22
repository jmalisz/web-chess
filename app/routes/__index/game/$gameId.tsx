import { useParams } from "@remix-run/react";
import { Chess } from "chess.js";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

// import sanitizeHtml from "sanitize-html";
import { GameChessboard } from "~/components/Chessboard";
import { useSocketIo } from "~/hooks/useSocketIo";
import type { SocketIoSessionDataSchema } from "~/utils/models";
import { socketIoGameDataSchema } from "~/utils/models";

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

  const socketContext = useSocketIo();

  const chatInputRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState<Chess>();
  const [gameData, setGameData] = useState<SocketIoSessionDataSchema>();

  useEffect(() => {
    if (!socketContext) return;

    const { socketIo } = socketContext;

    socketIo.emit("enterGameRoom", { gameId });
    socketIo.on("enterGameRoom", (data) => {
      const newGameData = socketIoGameDataSchema.parse(data);
      setGameData(newGameData);
      setGame(new Chess(newGameData.gamePosition));
    });
    socketIo.on("newGamePosition", (data) => {
      const { newGamePosition } = z.object({ newGamePosition: z.string() }).parse(data);
      setGameData((prev) => {
        if (!prev) throw new Error("Unexpected lack of gameData on newGamePosition");

        return { ...prev, gamePosition: newGamePosition };
      });
      setGame(new Chess(newGamePosition));
    });
  }, [gameId, socketContext]);

  // const chatKeyUpHandler = useCallback(
  //   (event: KeyboardEvent<HTMLDivElement>) => {
  //     if (!socketIo) return;

  //     const { key, shiftKey } = event;
  //     if (key === "Enter" && !shiftKey) {
  //       event.preventDefault();

  //       if (!chatInputRef.current?.textContent) return;

  //       const newChatMessagePayload: NewChatMessageSchemaInput = {
  //         userId: "123",
  //         gameId,
  //         newChatMessage: chatInputRef.current.textContent,
  //       };
  //       socketIo.emit("newChatMessage", newChatMessagePayload);
  //     }
  //   },
  //   [gameId, socketIo]
  // );

  if (!game || !gameData || !socketContext) return "Loading...";

  const { firstUserId, secondUserId, chatMessages } = gameData;
  const { socketIo, userId } = socketContext;

  return (
    <div className="flex h-4/5 gap-4">
      {/* Chessboard */}
      <GameChessboard
        game={game}
        side={firstUserId === userId ? "white" : "black"}
        onMove={(newGamePosition) => socketIo.emit("newGamePosition", { gameId, newGamePosition })}
      />
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
            // onKeyUp={chatKeyUpHandler}
          />
        </div>
      </div>
    </div>
  );
}

export default GameRoute;
