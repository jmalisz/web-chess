import path from "node:path";

import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

import { createSocketIoServer } from "./api/createSocketIoServer.server";

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

const { httpServer } = createSocketIoServer(app);

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/no-dynamic-require, global-require, unicorn/prefer-module
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
    : createRequestHandler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/no-dynamic-require, global-require, unicorn/prefer-module
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
);
const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Express server is running at http://localhost:${port}`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  // eslint-disable-next-line no-restricted-syntax, unicorn/prefer-module
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      // eslint-disable-next-line unicorn/prefer-module
      delete require.cache[key];
    }
  }
}

export { app };
