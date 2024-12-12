import { ContentBlockBlueprint, Project, User } from "@prisma/client";
import { prisma } from "~/db.server";

export const ALL_BLUEPRINT_SCHEMA_VALUE_TYPES = [
  "array",
  "string",
  "number",
  "block",
] as const;
export type ContentBlockBlueprintSchemaValueType =
  (typeof ALL_BLUEPRINT_SCHEMA_VALUE_TYPES)[number];

export type ContentBlockBlueprintSchemaValue =
  | {
      type: "array";
      itemType: ContentBlockBlueprintSchemaValue;
    }
  | {
      type: "string";
    }
  | {
      type: "number";
    }
  | {
      type: "block";
      blockType?: ContentBlockBlueprint["id"];
    };

export type ContentBlockBlueprintSchema = Record<
  string,
  ContentBlockBlueprintSchemaValue & { optional?: boolean }
>;

export const getAllContentBlockBlueprintsForProjectAndUser = (
  projectId: Project["id"],
  userId: User["id"],
): Promise<ContentBlockBlueprint[]> =>
  prisma.contentBlockBlueprint.findMany({
    where: {
      projectId,
      project: { userId },
    },
    include: {
      project: { select: { userId: true } },
    },
  });

export const createContentBlockBlueprint = (
  name: ContentBlockBlueprint["name"],
  type: ContentBlockBlueprint["type"],
  schema: ContentBlockBlueprint["schema"],
  projectId: Project["id"],
): Promise<ContentBlockBlueprint> =>
  prisma.contentBlockBlueprint.create({
    data: {
      projectId,
      name,
      type,
      schema: schema ?? {},
    },
  });
