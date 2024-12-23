import { ContentBlock, Project, User } from "@prisma/client";

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
      contentBlockBlueprint: {
        select: { projectId: true, tag: true, name: true },
      },
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

export const deleteContentBlockForUser = (
  id: ContentBlock["id"],
  userId: User["id"],
) =>
  prisma.contentBlock.delete({
    where: {
      id,
      contentBlockBlueprint: { project: { userId } },
    },
    include: {
      contentBlockBlueprint: {
        include: { project: { select: { userId: true } } },
      },
    },
  });

export const updateContentBlock = (
  id: ContentBlock["id"],
  name: ContentBlock["name"],
  contentBlockBlueprintId: ContentBlock["contentBlockBlueprintId"],
  tag: ContentBlock["tag"],
  content: ContentBlock["content"],
) =>
  prisma.contentBlock.update({
    where: { id },
    data: {
      name,
      contentBlockBlueprintId,
      tag,
      content: content ?? {},
    },
  });

export const createContentBlock = (
  name: ContentBlock["name"],
  contentBlockBlueprintId: ContentBlock["contentBlockBlueprintId"],
  tag: ContentBlock["tag"],
  content: ContentBlock["content"],
) =>
  prisma.contentBlock.create({
    data: {
      name,
      contentBlockBlueprintId,
      tag,
      content: content ?? {},
    },
  });
