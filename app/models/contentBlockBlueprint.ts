import {
  Asset,
  AssetType,
  ContentBlockBlueprint,
  Project,
  User,
} from "@prisma/client";
import { z } from "zod";

import { prisma } from "~/db.server";

export const ALL_BLUEPRINT_SCHEMA_VALUE_TYPES = [
  "array",
  "string",
  "markdown",
  "number",
  "block",
  "blueprint-block",
  "asset",
] as const;
export type ContentBlockBlueprintSchemaValueType =
  (typeof ALL_BLUEPRINT_SCHEMA_VALUE_TYPES)[number];

export type ContentBlockBlueprintSchemaValue =
  | {
      type: "array";
      itemType: ContentBlockBlueprintSchemaValue & { optional?: boolean };
    }
  | {
      type: "string";
    }
  | {
      type: "markdown";
    }
  | {
      type: "number";
    }
  | {
      type: "block";
      tag?: ContentBlockBlueprint["tag"];
    }
  | {
      type: "blueprint-block";
      blueprint: ContentBlockBlueprint["id"];
    }
  | {
      type: "asset";
      assetTypes: Asset["assetType"][];
    };

export type ContentBlockBlueprintSchema = Record<
  string,
  ContentBlockBlueprintSchemaValue & { optional?: boolean }
>;

export const getDisplayNameForContentBlockBlueprintSchemaValue = (
  value: ContentBlockBlueprintSchemaValue & { optional?: boolean },
): string => {
  const name = (() => {
    switch (value.type) {
      case "array":
        return `(${getDisplayNameForContentBlockBlueprintSchemaValue(value.itemType)})[]`;
      case "markdown":
        return "markdown";
      case "string":
        return "string";
      case "number":
        return "number";
      case "block":
        return value.tag ? `block (tag: ${value.tag})` : "block";
      case "blueprint-block":
        return `blueprint-block (${value.blueprint})`;
      case "asset":
        return `asset (${value.assetTypes.join(", ")})`;
    }
  })();

  return value.optional ? `${name}?` : name;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const getZodSchemaForContentBlockBlueprintSchemaValue = (
  value: ContentBlockBlueprintSchemaValue,
  optional: boolean,
) => {
  switch (value.type) {
    case "array":
      return z.array(
        getZodSchemaForContentBlockBlueprintSchemaValue(
          value.itemType,
          optional,
        ),
      );
    case "markdown":
    case "string":
      return optional ? z.string().optional() : z.string();
    case "number":
      return optional ? z.number().optional() : z.number();
    case "block":
      return optional ? z.string().optional() : z.string(); // block tag
    case "blueprint-block":
      return optional ? z.string().optional() : z.string(); // blueprint id
    case "asset":
      return optional ? z.string().optional() : z.string(); // asset id
  }
};

export const getZodSchemaForContentBlockBlueprintSchema = (
  schema: ContentBlockBlueprintSchema,
) => {
  return z.object(
    Object.fromEntries(
      Object.entries(schema).map(([key, value]) => [
        key,
        getZodSchemaForContentBlockBlueprintSchemaValue(
          value,
          value.optional ?? false,
        ),
      ]),
    ),
  );
};

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

export const deleteContentBlockBlueprintForProjectAndUser = (
  id: ContentBlockBlueprint["id"],
  userId: User["id"],
) =>
  prisma.contentBlockBlueprint.delete({
    where: {
      id,
      project: { userId },
    },
    include: {
      project: { select: { userId: true } },
    },
  });

export const updateContentBlockBlueprint = (
  id: ContentBlockBlueprint["id"],
  name: ContentBlockBlueprint["name"],
  type: ContentBlockBlueprint["type"],
  tag: ContentBlockBlueprint["tag"],
  schema: ContentBlockBlueprint["schema"],
): Promise<ContentBlockBlueprint> =>
  prisma.contentBlockBlueprint.update({
    where: { id },
    data: {
      name,
      tag,
      type,
      schema: schema ?? {},
    },
  });

export const createContentBlockBlueprint = (
  name: ContentBlockBlueprint["name"],
  type: ContentBlockBlueprint["type"],
  tag: ContentBlockBlueprint["tag"],
  schema: ContentBlockBlueprint["schema"],
  projectId: Project["id"],
): Promise<ContentBlockBlueprint> =>
  prisma.contentBlockBlueprint.create({
    data: {
      projectId,
      name,
      tag,
      type,
      schema: schema ?? {},
    },
  });

export const getContentBlockBlueprintById = (id: ContentBlockBlueprint["id"]) =>
  prisma.contentBlockBlueprint.findUnique({
    where: { id },
  });

export const getContentBlockBlueprintByIdForProject = (
  id: ContentBlockBlueprint["id"],
  projectId: Project["id"],
) =>
  prisma.contentBlockBlueprint.findUnique({
    where: { id, projectId },
  });
