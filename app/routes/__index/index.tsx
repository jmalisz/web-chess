import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { nanoid } from "nanoid";

// eslint-disable-next-line @typescript-eslint/require-await
export async function loader() {
  const newGameId = nanoid();

  return json({
    newGameId,
  });
}

export function IndexRoute() {
  const { newGameId } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-auto text-2xl">Would you want to play a game of chess?</h2>
      <div className="m-auto flex gap-4">
        <Link to={`/game/${newGameId}`}>
          <button className="btn-primary btn" type="button">
            Play with another person
          </button>
        </Link>
        <div className="tooltip tooltip-bottom tooltip-info" data-tip="Not implemented :(">
          <button className="btn-primary btn" type="button" disabled>
            Play with computer
          </button>
        </div>
      </div>
    </div>
  );
}

export default IndexRoute;
