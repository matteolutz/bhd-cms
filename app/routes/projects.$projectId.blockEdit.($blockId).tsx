import { Asset, ContentBlock, ContentBlockBlueprint } from "@prisma/client";
import { Select } from "@radix-ui/react-select";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ChevronDown, ChevronLeft, ChevronUp, Trash } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { TypographyH3 } from "~/components/typography";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { getAllAssetsForProject } from "~/models/asset.server";
import {
  createContentBlock,
  getAllContentBlocksInProject,
  getContentBlockByIdForProject,
  updateContentBlock,
} from "~/models/contentBlock.server";
import {
  ContentBlockBlueprintSchema,
  ContentBlockBlueprintSchemaValue,
  getAllContentBlockBlueprintsForProjectAndUser,
  getContentBlockBlueprintById,
  getZodSchemaForContentBlockBlueprintSchema,
} from "~/models/contentBlockBlueprint";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { arrayMax } from "~/utils/array";
import groupBy from "~/utils/group";
import { invariantFieldRequired } from "~/utils/invariant";
import omit from "~/utils/omit";

export const action = async ({
  request,
  params: { projectId, blockId },
}: ActionFunctionArgs) => {
  if (!projectId) {
    return { status: "error", reason: "projectId is required." };
  }

  const userId = await requireUserId(request);
  const project = await getProjectByIdForUserId(projectId, userId);

  if (!project) {
    return { status: "error", reason: "Project not found." };
  }

  const formData = await request.formData();

  const blockName = formData.get("name") as string | null;
  const blockBlueprintId = formData.get("blueprint") as string | null;
  const blockContent = JSON.parse(formData.get("content") as string);

  let blockTag = (formData.get("tag") as string | null)?.trim() ?? null;
  blockTag = blockTag === "" ? null : blockTag;

  if (
    !blockName ||
    blockName.trim() === "" ||
    !blockBlueprintId ||
    blockBlueprintId === ""
  ) {
    return { status: "error", reason: "Invalid parameters." };
  }

  const blockBlueprint = await getContentBlockBlueprintById(blockBlueprintId);
  if (!blockBlueprint) {
    return { status: "error", reason: "Invalid blueprint." };
  }

  const zodSchema = getZodSchemaForContentBlockBlueprintSchema(
    blockBlueprint.schema as ContentBlockBlueprintSchema,
  );

  const zodOutput = zodSchema.safeParse(blockContent);

  if (!zodOutput.success) {
    return { status: "error", reason: zodOutput.error.toString() };
  }

  if (blockId) {
    const block = await getContentBlockByIdForProject(blockId, project.id);

    if (!block) {
      return { status: "error", reason: "Block to edit not found." };
    }

    await updateContentBlock(
      block.id,
      blockName,
      blockBlueprint.id,
      blockTag,
      zodOutput.data,
    );
  } else {
    await createContentBlock(
      blockName,
      blockBlueprint.id,
      blockTag,
      zodOutput.data,
    );
  }

  return redirect("../blocks");
};

export const loader = async ({
  request,
  params: { projectId, blockId },
}: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariantFieldRequired(projectId, "projectId");

  const project = await getProjectByIdForUserId(projectId, userId);
  invariantFieldRequired(project, { message: "Project not found." });

  const blueprints = await getAllContentBlockBlueprintsForProjectAndUser(
    project.id,
    userId,
  );

  const contentBlocks = await getAllContentBlocksInProject(project.id);

  const assets = await getAllAssetsForProject(project.id);

  let block = null;
  if (blockId) {
    block = await getContentBlockByIdForProject(blockId, project.id);
  }

  return { blueprints, contentBlocks, block, assets };
};

const SchemaValueInputComponent: FC<{
  fieldName: string;
  schemaValue: ContentBlockBlueprintSchemaValue;
  content: Record<string, unknown>;
  setContent: (value: Record<string, unknown>) => void;
  data: {
    contentBlocks: Omit<
      ContentBlock & {
        contentBlockBlueprint: { tag: string | null };
      },
      "createdAt" | "updatedAt"
    >[];
    assets: Omit<Asset, "createdAt" | "updatedAt">[];
  };
}> = ({ fieldName, schemaValue, content, setContent, data }) => {
  switch (schemaValue.type) {
    case "array": {
      const contentArray = content[fieldName] as unknown[];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [localContent, setLocalContent] = useState<Record<string, unknown>>(
        contentArray
          ? Object.fromEntries(contentArray.map((c, idx) => [idx, c]))
          : {},
      );
      console.log(localContent);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        setContent({
          ...content,
          [fieldName]: Object.entries(localContent)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([, value]) => value),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [localContent]);

      return (
        <div className="flex flex-col gap-1 pl-2">
          {Object.keys(localContent)?.map((idx) => (
            <div key={idx} className="flex items-center gap-1">
              <div className="flex flex-col">
                <Button
                  onClick={() => {
                    // decrement index
                    const values = Object.entries(localContent)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([, value]) => value);

                    const currentIdx = values.indexOf(localContent[idx]);

                    if (currentIdx == 0) return;

                    const valueBelow = values[currentIdx - 1];
                    values[currentIdx - 1] = localContent[currentIdx];
                    values[currentIdx] = valueBelow;

                    setLocalContent(
                      Object.fromEntries(
                        values.map((value, idx) => [idx, value]),
                      ),
                    );
                  }}
                  size="icon"
                  variant="ghost"
                  type="button"
                >
                  <ChevronUp />
                </Button>
                <Button
                  onClick={() => {
                    // increment index
                    const values = Object.entries(localContent)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([, value]) => value);

                    const currentIdx = values.indexOf(localContent[idx]);

                    if (currentIdx == values.length - 1) return;

                    const valueAbove = values[currentIdx + 1];
                    values[currentIdx + 1] = localContent[currentIdx];
                    values[currentIdx] = valueAbove;

                    setLocalContent(
                      Object.fromEntries(
                        values.map((value, idx) => [idx, value]),
                      ),
                    );
                  }}
                  size="icon"
                  variant="ghost"
                  type="button"
                >
                  <ChevronDown />
                </Button>
              </div>
              <SchemaValueInputComponent
                content={localContent}
                setContent={setLocalContent}
                data={data}
                fieldName={"" + idx}
                schemaValue={schemaValue.itemType}
              />
              <Button
                onClick={() => setLocalContent(omit(localContent, idx))}
                variant="destructive"
                type="button"
                size="icon"
              >
                <Trash />
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setLocalContent({
                ...localContent,
                [arrayMax(
                  Object.keys(localContent).map((k) => parseInt(k)),
                  -1,
                ) + 1]: null,
              })
            }
            type="button"
            variant="outline"
          >
            Add Item
          </Button>
        </div>
      );
    }
    case "number":
    case "string": {
      return (
        <Input
          type={schemaValue.type === "string" ? "text" : "number"}
          value={(content[fieldName] as string) ?? ""}
          onChange={(e) =>
            setContent({
              ...content,
              [fieldName]:
                schemaValue.type === "number"
                  ? parseInt(e.target.value)
                  : e.target.value,
            })
          }
        />
      );
    }
    case "markdown":
      return (
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="editor">
            <Textarea
              rows={10}
              className="resize-y"
              value={(content[fieldName] as string) ?? ""}
              onChange={(e) =>
                setContent({
                  ...content,
                  [fieldName]: e.target.value,
                })
              }
            />
          </TabsContent>
          <TabsContent value="preview">
            <div>{(content[fieldName] as string) ?? ""}</div>
          </TabsContent>
        </Tabs>
      );
    case "asset":
      return (
        <Select
          onValueChange={(newValue) =>
            setContent({
              ...content,
              [fieldName]: newValue,
            })
          }
          value={(content[fieldName] as string) ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an Asset" />
          </SelectTrigger>
          <SelectContent>
            {data.assets
              .filter((asset) =>
                schemaValue.assetTypes.includes(asset.assetType),
              )
              .map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      );
    case "blueprint-block":
    case "block": {
      return (
        <Select
          onValueChange={(newValue) =>
            setContent({
              ...content,
              [fieldName]: newValue,
            })
          }
          value={(content[fieldName] as string) ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a block" />
          </SelectTrigger>
          <SelectContent>
            {data.contentBlocks
              .filter(
                (block) =>
                  (schemaValue.type === "block" &&
                    (!schemaValue.tag ||
                      schemaValue.tag === block.contentBlockBlueprint.tag)) ||
                  (schemaValue.type === "blueprint-block" &&
                    schemaValue.blueprint === block.contentBlockBlueprintId),
              )
              .map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      );
    }
  }
};

const ProjectPageEditBlock = () => {
  const { blueprints, contentBlocks, block, assets } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [blockName, setBlockName] = useState<string>(block?.name ?? "");

  const [selectedBlueprint, setSelectedBlueprint] = useState<
    ContentBlockBlueprint["id"] | null
  >(block ? block.contentBlockBlueprintId : null);

  const [blockTag, setBlockTag] = useState<string>(block?.tag ?? "");

  const getBlueprint = (id: ContentBlockBlueprint["id"]) =>
    blueprints.find((b) => b.id === id);

  const [content, setContent] = useState<Record<string, unknown>>(
    block ? (block.content as Record<string, unknown>) : {},
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="../blocks">
            <ChevronLeft />
          </Link>
        </Button>
        <TypographyH3 className="mt-0">
          {block ? `Edit Content Block "${block.name}"` : "New Content Block"}
        </TypographyH3>
      </div>

      {actionData?.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{actionData.reason}</AlertDescription>
        </Alert>
      ) : null}

      <Form className="flex flex-col gap-8 p-2" method="post">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inputName">Name</Label>
          <Input
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            id="inputName"
            name="name"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="selectBlueprint">Blueprint</Label>
          <Select
            value={selectedBlueprint ?? undefined}
            onValueChange={setSelectedBlueprint}
            name="blueprint"
            required
          >
            <SelectTrigger id="selectBlueprint">
              <SelectValue placeholder="Choose a blueprint" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(groupBy(blueprints, (b) => b.type).entries()).map(
                ([blueprintType, blueprints]) => (
                  <SelectGroup key={blueprintType}>
                    <SelectLabel>{blueprintType}</SelectLabel>
                    {blueprints.map((blueprint) => (
                      <SelectItem key={blueprint.id} value={blueprint.id}>
                        {blueprint.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="inputTag">Tag (optional)</Label>
          <Input
            value={blockTag}
            onChange={(e) => setBlockTag(e.target.value)}
            id="inputTag"
            name="tag"
            type="text"
          />
        </div>

        {/* eslint-disable-next-line react/jsx-no-leaked-render */}
        {selectedBlueprint && (
          <div className="flex flex-col gap-2 divide-y">
            <h4>Fields</h4>
            {Object.entries(
              getBlueprint(selectedBlueprint)!
                .schema as ContentBlockBlueprintSchema,
            ).map(([fieldName, fieldValue]) => (
              <div className="flex flex-col gap-2" key={fieldName}>
                <h5>{fieldName}</h5>
                <div>
                  <SchemaValueInputComponent
                    fieldName={fieldName}
                    schemaValue={fieldValue}
                    content={content}
                    setContent={setContent}
                    data={{ contentBlocks, assets }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="content" value={JSON.stringify(content)} />
        <Button type="submit">{block ? "Save Block" : "Create Block"}</Button>
      </Form>
    </div>
  );
};

export default ProjectPageEditBlock;
