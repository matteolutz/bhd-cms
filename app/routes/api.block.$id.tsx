import { LoaderFunctionArgs } from "@remix-run/node";
import { getContentBlockByIdForProject } from "~/models/contentBlock.server";

import { requireProjectAccessToken } from "~/models/projectAccessToken";

export const loader = async ({
  request,
  params: { id },
}: LoaderFunctionArgs) => {
  const project = await requireProjectAccessToken(request);

  if (!id) throw new Error("Block id is required");

  const block = await getContentBlockByIdForProject(id, project.id);

  if (!block) throw new Error("Block not found");

  return { block };
};
