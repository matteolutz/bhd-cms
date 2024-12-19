import * as fs from "fs/promises";
import * as path from "path";

import { Asset, Project, User } from "@prisma/client";

import { prisma } from "~/db.server";


export type { Asset } from "@prisma/client";

export const getAllAssetsForProject = (projectId: Project["id"]) =>
  prisma.asset.findMany({
    where: {
      projectId,
    },
  });

export const getAssetByIdForProject = (
  id: Asset["id"],
  projectId: Project["id"],
) =>
  prisma.asset.findUnique({
    where: {
      id,
      projectId,
    },
  });

export const deleteAssetByIdForProjectAndUser = async (
  id: Asset["id"],
  projectId: Project["id"],
  userId: User["id"],
) => {
  const asset = await prisma.asset.delete({
    where: {
      id,
      projectId,
      project: { userId },
    },
    include: { project: { select: { userId: true } } },
  });

  await fs.rmdir(getInternalAssetFilePath(asset, false), { recursive: true });
};

export const getInternalAssetFilePath = (asset: Asset, actualFile = true) =>
  path.join(
    process.env.FILE_ROOT as string,
    "assets",
    asset.id,
    actualFile ? asset.fileName : "",
  );
