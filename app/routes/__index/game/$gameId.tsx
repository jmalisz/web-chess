import { useParams } from "@remix-run/react";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Chatbox } from "~/components/Chatbox";
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
      <div className="modal-box max-w-xs">
        <h3 className="text-center text-lg font-bold">{title}</h3>
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

const enterGameRoomEventSchema = z.object({
  gamePositionFen: z.string(),
  side: z.enum(["white", "black"]),
  chatMessages: z.array(
    z.object({
      id: z.string(),
      isYour: z.boolean(),
      content: z.string(),
    })
  ),
});
type GameDataType = Omit<z.infer<typeof enterGameRoomEventSchema>, "chatMessages">;

const newGamePositionEventSchema = enterGameRoomEventSchema.pick({ gamePositionFen: true });

const newChatMessageEventSchema = enterGameRoomEventSchema.shape.chatMessages.element;
type ChatMessages = z.infer<typeof enterGameRoomEventSchema.shape.chatMessages>;

export function GameRoute() {
  const { gameId } = useParams();
  if (!gameId) throw new Error("This shouldn't be matched by router");

  const socketIo = useSocketIo();
  const { setDialog } = useDialogContext();

  const [game, setGame] = useState<Chess>(new Chess());
  const [gameData, setGameData] = useState<GameDataType>();
  const [chatMessages, setChatMessages] = useState<ChatMessages>([]);

  useEffect(() => {
    if (!socketIo) return;

    socketIo.emit("enterGameRoom", { gameId });

    socketIo.on("enterGameRoom", (data) => {
      const {
        gamePositionFen,
        side,
        chatMessages: newChatMessages,
      } = enterGameRoomEventSchema.parse(data);

      setGame(new Chess(gamePositionFen));
      setGameData({ gamePositionFen, side });
      setChatMessages(newChatMessages);
    });
    socketIo.on("newGamePosition", (data) => {
      const { gamePositionFen } = newGamePositionEventSchema.parse(data);
      setGameData((prev) => {
        if (!prev) throw new Error("Unexpected, gameData not defined in newGamePosition event");

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
    socketIo.on("newChatMessage", (data) => {
      const newChatMessage = newChatMessageEventSchema.parse(data);
      setChatMessages((prev) => [...prev, newChatMessage]);
    });
  }, [gameId, setDialog, socketIo]);

  if (!game || !gameData || !socketIo) return "Loading...";

  return (
    <div className="flex gap-4">
      <GameChessboard
        game={game}
        side={gameData.side}
        onMove={(from, to) => socketIo.emit("newGamePosition", { gameId, from, to })}
        onSurrender={() => socketIo.emit("surrender", { gameId })}
        onUndo={() => socketIo.emit("undoAsk", { gameId })}
      />
      <Chatbox
        chatMessages={chatMessages}
        onNewChatMessage={(newChatMessage) =>
          socketIo.emit("newChatMessage", { gameId, newChatMessage })
        }
      />
    </div>
  );
}

export default GameRoute;
