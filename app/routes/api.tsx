import { json } from "@remix-run/node";

export const loader = () =>
  json(
    {
      status: "OK",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
