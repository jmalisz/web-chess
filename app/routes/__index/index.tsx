import { Link } from "@remix-run/react";

export function IndexRoute() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-auto text-2xl">Would you want to play a game of chess?</h2>
      <div className="m-auto flex gap-4">
        <Link to="/game">
          <button className="btn-primary btn" type="button">
            Play with another person
          </button>
        </Link>
        <Link to="/game">
          <button className="btn-primary btn" type="button">
            Play with computer
          </button>
        </Link>
      </div>
    </div>
  );
}

export default IndexRoute;
