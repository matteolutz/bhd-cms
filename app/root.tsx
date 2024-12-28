import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import { Copy } from "lucide-react";

import { getUser } from "~/session.server";
import stylesheet from "~/styles/tailwind.css";

import { GlobalLoading } from "./components/loader";
import {
  TypographyH1,
  TypographyInlineCode,
  TypographyP,
} from "./components/typography";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/toaster";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    user: await getUser(request),
  });
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);

  const location = useLocation();

  const errorText = "" + error;

  return (
    <html lang="en" className="size-full">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="size-full">
        <main className="flex size-full flex-col items-center justify-center gap-2 p-4">
          <TypographyH1 className="text-center">
            Oh no, something went wrong!
          </TypographyH1>
          <div className="flex items-center gap-1">
            <TypographyInlineCode id="errorInformation">
              {location.pathname}
              <br />
              {errorText}
            </TypographyInlineCode>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                window
                  .getSelection()
                  ?.selectAllChildren(
                    document.getElementById("errorInformation")!,
                  );
                // write to the clipboard
                navigator.clipboard.writeText(errorText);
              }}
            >
              <Copy />
            </Button>
          </div>
          <TypographyP>
            If this keeps happening, please hit me up at{" "}
            <Button className="m-0 size-fit p-0 px-1" variant="link" asChild>
              <a href="mailto:info@matteolutz.de">info@matteolutz.de</a>
            </Button>{" "}
            and provide the error information above.
          </TypographyP>
          <Button asChild>
            <Link to="/">Go back home!</Link>
          </Button>
        </main>
        <Scripts />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <GlobalLoading />

        <Outlet />

        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
