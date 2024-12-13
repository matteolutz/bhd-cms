import { LoaderFunctionArgs } from "@remix-run/node";

import { getContentBlockByIdForProject } from "~/models/contentBlock.server";
import { requireProjectAccessToken } from "~/models/projectAccessToken";
import { invariantFieldRequired } from "~/utils/invariant";

export const loader = async ({
  request,
  params: { id },
}: LoaderFunctionArgs) => {
  const project = await requireProjectAccessToken(request);

  invariantFieldRequired(id, "id");

  const block = await getContentBlockByIdForProject(id, project.id);

  invariantFieldRequired(block, { message: "Block not found" });

  return cors();
};
