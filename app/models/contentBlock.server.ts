import { ContentBlock, Project } from "@prisma/client";

import { prisma } from "~/db.server";

export type { ContentBlock } from "@prisma/client";

type ContentBlockPageContent = {
  children: string[];
} & Record<string, unknown>;

type ContentBlockUiComponentContent = Record<string, unknown>;
type ContentBlockConfigContent = Record<string, unknown>;

export const getContentBlockByIdForProject = (
  id: ContentBlock["id"],
  projectId: Project["id"],
): Promise<ContentBlock | null> =>
  prisma.contentBlock.findUnique({
    where: {
      id,
      contentBlockBlueprint: { projectId },
    },
    include: { contentBlockBlueprint: { select: { projectId: true } } },
  });

export const getAllContentBlocksInProject = (
  projectId: Project["id"],
): Promise<ContentBlock[]> =>
  prisma.contentBlock.findMany({
    where: {
      contentBlockBlueprint: { projectId },
    },
    include: { contentBlockBlueprint: { select: { projectId: true } } },
  });
