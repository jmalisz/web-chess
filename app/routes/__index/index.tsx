import { Link } from "@remix-run/react";

import { Button } from "~/components/Button";

export function IndexRoute() {
  return (
    <div className="flex flex-col gap-4">
      <span className="m-auto">Would you want to play a game of chess?</span>
      <div className="m-auto flex gap-4">
        <Link to="/game">
          <Button className="w-60">Play with another person</Button>
        </Link>
        <Link to="/game">
          <Button className="w-60">Play with computer</Button>
        </Link>
      </div>
    </div>
  );
}

export default IndexRoute;
