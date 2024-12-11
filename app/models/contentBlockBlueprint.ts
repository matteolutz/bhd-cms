import { ContentBlockBlueprint } from "@prisma/client";

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
