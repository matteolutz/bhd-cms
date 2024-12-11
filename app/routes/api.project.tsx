import { LoaderFunctionArgs } from "@remix-run/node";

import { requireProjectAccessToken } from "~/models/projectAccessToken";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const project = await requireProjectAccessToken(request);

  return { project };
};
