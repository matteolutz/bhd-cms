import * as fs from "fs/promises";
import * as path from "path";

import { Asset, AssetType, Project, User } from "@prisma/client";

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
  userId: User["id"],
) => {
  const asset = await prisma.asset.delete({
    where: {
      id,
      project: { userId },
    },
    include: { project: { select: { userId: true } } },
  });

  await fs.rm(getInternalAssetFilePath(asset));
};

export const getAssetTypeForMimeType = (
  mimeType: Asset["mimeType"],
): AssetType => {
  if (mimeType.startsWith("image/")) return AssetType.IMAGE;
  if (mimeType.startsWith("video/")) return AssetType.VIDEO;
  if (mimeType.startsWith("audio/")) return AssetType.AUDIO;
  if (mimeType === "application/pdf") return AssetType.DOCUMENT;
  return AssetType.OTHER;
};

export const createAsset = (
  name: Asset["name"],
  tag: Asset["tag"],
  fileName: Asset["fileName"],
  mimeType: Asset["mimeType"],
  projectId: Asset["projectId"],
) =>
  prisma.asset.create({
    data: {
      name,
      tag,
      fileName,
      mimeType,
      assetType: getAssetTypeForMimeType(mimeType),
      projectId,
    },
  });

export const updateAsset = (
  id: Asset["id"],
  name: Asset["name"],
  tag: Asset["tag"],
) =>
  prisma.asset.update({
    where: {
      id,
    },
    data: {
      name,
      tag,
    },
  });

export const cleanAssets = async (): Promise<number> => {
  const assetFileNames = (
    await prisma.asset.findMany({ select: { fileName: true } })
  ).map((asset) => asset.fileName);

  const localFiles = await fs.readdir(ASSET_FILE_ROOT);

  const filesToDelete = localFiles.filter(
    (file) => !assetFileNames.includes(file),
  );

  for (const file of filesToDelete) {
    await fs.rm(path.join(ASSET_FILE_ROOT, file));
  }

  return filesToDelete.length;
};

export const ASSET_FILE_ROOT = path.join(
  process.env.FILE_ROOT as string,
  "assets",
);

export const getInternalAssetFilePath = (asset: Asset) =>
  path.join(ASSET_FILE_ROOT, asset.fileName);
