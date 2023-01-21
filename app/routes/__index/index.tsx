import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { SocketIoSessionDataSchema } from "~/api/createSocketIoServer.server";

import { useSocketIo } from "~/hooks/useSocketIo";

const SESSION_ID_LS_KEY = "sessionID";

// eslint-disable-next-line @typescript-eslint/require-await
export async function loader() {
  const newGameSessionId = nanoid();

  return json({
    newGameSessionId,
  });
}

export function IndexRoute() {
  const { newGameSessionId } = useLoaderData<typeof loader>();

  const socketIo = useSocketIo();
  useEffect(() => {
    if (!socketIo) return;

    const savedSessionId = localStorage.getItem(SESSION_ID_LS_KEY);

    if (savedSessionId) {
      socketIo.auth = { sessionId: savedSessionId };
    }
    socketIo.connect();

    socketIo.on(
      "connected",
      ({ sessionId, userId }: Pick<SocketIoSessionDataSchema, "sessionId" | "userId">) => {
        socketIo.auth = { sessionId, userId };
        localStorage.setItem(SESSION_ID_LS_KEY, sessionId);
      }
    );
  }, [socketIo]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-auto text-2xl">Would you want to play a game of chess?</h2>
      <div className="m-auto flex gap-4">
        <Link to={`/game/${newGameSessionId}`}>
          <button className="btn-primary btn" type="button">
            Play with another person
          </button>
        </Link>
        <Link to={`/game/${newGameSessionId}`}>
          <button className="btn-primary btn" type="button">
            Play with computer
          </button>
        </Link>
      </div>
    </div>
  );
}

export default IndexRoute;
