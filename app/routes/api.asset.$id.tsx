import * as fs from "fs";

import { LoaderFunctionArgs } from "@remix-run/node";

import {
  getAssetByIdForProject,
  getInternalAssetFilePath,
} from "~/models/asset.server";
import { requireProjectAccessToken } from "~/models/projectAccessToken";
import { invariantFieldRequired } from "~/utils/invariant";

export const loader = async ({
  request,
  params: { id },
}: LoaderFunctionArgs) => {
  const project = await requireProjectAccessToken(request);

  invariantFieldRequired(id, "id");

  const asset = await getAssetByIdForProject(id, project.id);

  invariantFieldRequired(asset, { message: "Asset not found" });

  const filePath = getInternalAssetFilePath(asset);

  const fileStream = fs.createReadStream(filePath);

  return new Response(fileStream as unknown as BodyInit, {
    headers: {
      "Content-Disposition": `attachment; filename="${asset.fileName}"`,
      "Content-Type": asset.mimeType,
    },
  });
};
