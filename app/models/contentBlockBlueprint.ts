import { ContentBlockBlueprint } from "@prisma/client";

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
