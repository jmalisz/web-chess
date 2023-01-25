import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import { DialogContextProvider } from "./hooks/useDialog";
import { SocketIoProvider } from "./hooks/useSocketIo";
import styles from "./styles/app.css";

// https://remix.run/docs/en/v1/guides/envvars
declare global {
  interface Window {
    ENV: {
      NODE_ENV: "development" | "production" | "test";
      SOCKET_IO_URL?: string;
    };
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function loader() {
  return json({
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
      SOCKET_IO_URL: process.env.SOCKET_IO_URL,
    },
  });
}

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", type: "image/png" },
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => ({
  // eslint-disable-next-line unicorn/text-encoding-identifier-case
  charset: "utf-8",
  title: "Web-Chess",
  viewport: "width=device-width,initial-scale=1",
  description: "Simple web client for playing chess",
});

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <SocketIoProvider>
          <DialogContextProvider>
            <Outlet />
          </DialogContextProvider>
        </SocketIoProvider>
        <ScrollRestoration />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
