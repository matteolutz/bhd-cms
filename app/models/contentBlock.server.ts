import { ContentBlock, Project } from "@prisma/client";
import e from "express";

import { prisma } from "~/db.server";

export type { ContentBlock } from "@prisma/client";

export const getContentBlockByIdForProject = (
  id: ContentBlock["id"],
  projectId: Project["id"],
) =>
  prisma.contentBlock.findUnique({
    where: {
      id,
      contentBlockBlueprint: { projectId },
    },
    include: {
      contentBlockBlueprint: { select: { projectId: true, tag: true } },
    },
  });

export const getAllContentBlocksInProject = (projectId: Project["id"]) =>
  prisma.contentBlock.findMany({
    where: {
      contentBlockBlueprint: { projectId },
    },
    include: {
      contentBlockBlueprint: {
        select: { projectId: true, tag: true, type: true, name: true },
      },
    },
  });

export const updateContentBlock = (
  id: ContentBlock["id"],
  name: ContentBlock["name"],
  contentBlockBlueprintId: ContentBlock["contentBlockBlueprintId"],
  content: ContentBlock["content"],
) =>
  prisma.contentBlock.update({
    where: { id },
    data: {
      name,
      contentBlockBlueprintId,
      content: content ?? {},
    },
  });

export const createContentBlock = (
  name: ContentBlock["name"],
  contentBlockBlueprintId: ContentBlock["contentBlockBlueprintId"],
  content: ContentBlock["content"],
) =>
  prisma.contentBlock.create({
    data: {
      name,
      contentBlockBlueprintId,
      content: content ?? {},
    },
  });
