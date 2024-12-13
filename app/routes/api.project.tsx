import { json, LoaderFunctionArgs } from "@remix-run/node";

import { requireProjectAccessToken } from "~/models/projectAccessToken";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const project = await requireProjectAccessToken(request);

  return json(
    { project },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
