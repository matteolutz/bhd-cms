import { ContentBlock} from "@prisma/client";
import { prisma } from "~/db.server";

export type { ContentBlock } from "@prisma/client";

type ContentBlockPageContent = {
  children: Array<string>;
} & Record<string, unknown>;

type ContentBlockUiComponentContent = Record<string, unknown>;
type ContentBlockConfigContent = Record<string, unknown>;

export const getAllContentBlocksInProject = (projectId: string): Promise<Array<ContentBlock> =>
  prisma.contentBlock.findMany({
    where: {
      projectId: projectId,
    },
  });
