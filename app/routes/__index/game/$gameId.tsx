import { useParams } from "@remix-run/react";
import { Chess } from "chess.js";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

// import sanitizeHtml from "sanitize-html";
import { GameChessboard } from "~/components/Chessboard";
import { useDialogContext } from "~/hooks/useDialog";
import { useSocketIo } from "~/hooks/useSocketIo";

type GameFinishedDialogProps = {
  title: string;
  onOk: () => void;
};

function GameFinishedDialog({ title, onOk }: GameFinishedDialogProps) {
  return (
    <div className="modal visible">
      <div className="modal-box">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="modal-action justify-evenly">
          <button className="btn-primary btn" type="button" onClick={onOk}>
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

type UndoAskDialogProps = {
  onNo: () => void;
  onYes: () => void;
};

function UndoAskDialog({ onNo, onYes }: UndoAskDialogProps) {
  return (
    <div className="modal visible">
      <div className="modal-box">
        <h3 className="text-lg font-bold">Your opponent is asking to undo his last move</h3>
        <p className="py-4">Do you grant the undo?</p>
        <div className="modal-action justify-evenly">
          <button className="btn-primary btn" type="button" onClick={onNo}>
            No
          </button>
          <button className="btn-primary btn" type="button" onClick={onYes}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

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
const socketIoGameDataSchema = z.object({
  gamePositionFen: z.string(),
  side: z.enum(["white", "black"]),
  chatMessages: z.array(
    z.object({
      fromUserId: z.string(),
      content: z.string(),
    })
  ),
});
type SocketIoGameDataSchemaType = z.infer<typeof socketIoGameDataSchema>;

const newGamePositionEventSchema = z.object({
  gamePositionFen: z.string(),
});

export function GameRoute() {
  const { gameId } = useParams();
  if (!gameId) throw new Error("This shouldn't be matched by router");

  const socketIo = useSocketIo();
  const { setDialog } = useDialogContext();

  const chatInputRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState<Chess>(new Chess());
  const [gameData, setGameData] = useState<SocketIoGameDataSchemaType>();

  useEffect(() => {
    if (!socketIo) return;

    socketIo.emit("enterGameRoom", { gameId });

    socketIo.on("enterGameRoom", (data) => {
      const newGameData = socketIoGameDataSchema.parse(data);
      setGameData(newGameData);
      setGame(new Chess(newGameData.gamePositionFen));
    });
    socketIo.on("newGamePosition", (data) => {
      const { gamePositionFen } = newGamePositionEventSchema.parse(data);
      setGameData((prev) => {
        if (!prev) throw new Error("Unexpected lack of gameData on newGamePosition");

        return { ...prev, gamePositionFen };
      });
      setGame(new Chess(gamePositionFen));
    });
    socketIo.on("victory", () => {
      setDialog(<GameFinishedDialog title="You won!" onOk={() => setDialog(undefined)} />);
    });
    socketIo.on("defeat", () => {
      setDialog(<GameFinishedDialog title="You lost!" onOk={() => setDialog(undefined)} />);
    });
    socketIo.on("draw", () => {
      setDialog(<GameFinishedDialog title="A draw!" onOk={() => setDialog(undefined)} />);
    });
    socketIo.on("undoAsk", () => {
      setDialog(
        <UndoAskDialog
          onNo={() => {
            socketIo.emit("undoAnswer", { gameId, answer: false });
            setDialog(undefined);
          }}
          onYes={() => {
            socketIo.emit("undoAnswer", { gameId, answer: true });
            setDialog(undefined);
          }}
        />
      );
    });
  }, [gameId, setDialog, socketIo]);

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

  if (!game || !gameData || !socketIo) return "Loading...";

  const { side, chatMessages } = gameData;

  return (
    <div className="flex h-4/5 gap-4">
      {/* Chessboard */}
      <GameChessboard
        game={game}
        side={side}
        onMove={(from, to) => socketIo.emit("newGamePosition", { gameId, from, to })}
        onSurrender={() => socketIo.emit("surrender", { gameId })}
        onUndo={() => socketIo.emit("undoAsk", { gameId })}
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
