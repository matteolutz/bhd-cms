import { ContentBlockBlueprint, ContentBlockType } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { FC, useState } from "react";

import { TypographyH3 } from "~/components/typography";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ALL_BLUEPRINT_SCHEMA_VALUE_TYPES,
  ContentBlockBlueprintSchema,
  ContentBlockBlueprintSchemaValue,
  ContentBlockBlueprintSchemaValueType,
  createContentBlockBlueprint,
  getAllContentBlockBlueprintsForProjectAndUser,
  getContentBlockBlueprintByIdForProject,
  updateContentBlockBlueprint,
} from "~/models/contentBlockBlueprint";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";
import omit from "~/utils/omit";

export const action = async ({
  request,
  params: { projectId, bpId },
}: ActionFunctionArgs) => {
  if (!projectId) {
    return { stauts: "error" };
  }

  const userId = await requireUserId(request);
  const project = await getProjectByIdForUserId(projectId, userId);

  if (!project) {
    return { status: "error" };
  }

  const formData = await request.formData();

  const blueprintName = formData.get("name") as string;

  let blueprintTag = (formData.get("tag") as string | null)?.trim() ?? null;
  blueprintTag = blueprintTag === "" ? null : blueprintTag;

  const blueprintType = formData.get("type") as ContentBlockType;
  const blueprintFields = JSON.parse(formData.get("schema") as string);

  if (
    !blueprintName ||
    blueprintName === "" ||
    !blueprintType ||
    !Object.keys(ContentBlockType).includes(blueprintType as string)
  ) {
    return { status: "error" };
  }

  if (bpId) {
    const blueprint = await getContentBlockBlueprintByIdForProject(
      bpId,
      project.id,
    );
    if (!blueprint) {
      return { status: "error", reason: "Blueprint not found." };
    }

    await updateContentBlockBlueprint(
      blueprint.id,
      blueprintName,
      blueprintType,
      blueprintTag,
      blueprintFields,
    );
  } else {
    await createContentBlockBlueprint(
      blueprintName,
      blueprintType,
      blueprintTag,
      blueprintFields,
      project.id,
    );
  }

  return redirect("../blueprints");
};

export const loader = async ({
  request,
  params: { projectId, bpId },
}: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  invariantFieldRequired(projectId, "projectId");

  const contentBlockBlueprints =
    await getAllContentBlockBlueprintsForProjectAndUser(projectId, userId);

  if (bpId) {
    const blueprint = contentBlockBlueprints.find((bp) => bp.id === bpId);
    invariantFieldRequired(blueprint, { message: "Blueprint not found." });
    return { contentBlockBlueprints, blueprint };
  }

  return { contentBlockBlueprints, blueprint: null };
};

const EditSchemaEntryComponent: FC<{
  setNewValueType: (valueType: ContentBlockBlueprintSchemaValueType) => void;
  setOptional: (optional: boolean) => void;
  setAttribute: (attribute: string, value: unknown) => void;
  value: ContentBlockBlueprintSchemaValue & { optional?: boolean };
  args: {
    contentBlockBlueprints: Omit<
      ContentBlockBlueprint,
      "createdAt" | "updatedAt"
    >[];
  };
}> = ({ value, setNewValueType, setOptional, setAttribute, args }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Select onValueChange={setNewValueType.bind(this)} value={value.type}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a field type" />
          </SelectTrigger>
          <SelectContent>
            {ALL_BLUEPRINT_SCHEMA_VALUE_TYPES.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col items-center gap-2">
          <Label>Optional?</Label>
          <Checkbox
            onCheckedChange={setOptional.bind(this)}
            checked={value.optional}
          />
        </div>
      </div>
      <div>
        {(() => {
          switch (value.type) {
            case "blueprint-block":
              return (
                <Select
                  onValueChange={(newBlueprint) =>
                    setAttribute("blueprint", newBlueprint)
                  }
                  value={value.blueprint}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Block Blueprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {args.contentBlockBlueprints.map((bp) => (
                      <SelectItem key={bp.id} value={bp.id}>
                        {bp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            case "block":
              return (
                <Input
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  value={value.tag}
                  onChange={(e) => {
                    if (e.target.value && e.target.value.trim() !== "")
                      setAttribute("tag", e.target.value.trim());
                  }}
                  type="text"
                  placeholder="Block Tag (optional)"
                />
              );
            case "array":
              return (
                <div className="pl-2">
                  <EditSchemaEntryComponent
                    setOptional={(optional) =>
                      setAttribute("itemType", {
                        ...value.itemType,
                        optional,
                      })
                    }
                    setAttribute={(attribute, attributeValue) =>
                      setAttribute("itemType", {
                        ...value.itemType,
                        [attribute]: attributeValue,
                      })
                    }
                    setNewValueType={(newValueType) => {
                      const newValue: Record<string, unknown> = {
                        type: newValueType,
                        optional: value.itemType.optional,
                      };

                      if (newValueType === "array") {
                        newValue.itemType = {
                          type: "string",
                        };
                      }

                      setAttribute("itemType", newValue);
                    }}
                    value={value.itemType}
                    args={args}
                  />
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

const ProjectPageBlueprintEdit = () => {
  const { contentBlockBlueprints, blueprint } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [blueprintName, setBlueprintName] = useState(
    blueprint ? blueprint.name : "",
  );
  const [blueprintTag, setBlueprintTag] = useState(
    blueprint ? (blueprint.tag ?? "") : "",
  );
  const [blueprintType, setBlueprintType] = useState(
    blueprint ? blueprint.type : "",
  );

  const [schema, setSchema] = useState<ContentBlockBlueprintSchema>(
    blueprint ? (blueprint.schema as ContentBlockBlueprintSchema) : {},
  );

  const [newFieldInputValue, setNewFieldInputValue] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="../blueprints">
            <ChevronLeft />
          </Link>
        </Button>
        <TypographyH3 className="mt-0">
          {blueprint ? `Edit Blueprint "${blueprint.name}"` : "New Blueprint"}
        </TypographyH3>
      </div>

      {actionData?.status === "error" ? (
        <Alert variant="destructive">Error</Alert>
      ) : null}

      <Form className="flex flex-col gap-8 p-2" method="post">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inputName">Name</Label>
          <Input
            value={blueprintName}
            onChange={(e) => setBlueprintName(e.target.value)}
            id="inputName"
            name="name"
            type="text"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="inputTag">Tag (optional)</Label>
          <Input
            value={blueprintTag}
            onChange={(e) => setBlueprintTag(e.target.value)}
            id="inputTag"
            name="tag"
            type="text"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="selectType">Blueprint Type</Label>
          <Select
            value={blueprintType}
            onValueChange={setBlueprintType}
            name="type"
            required
          >
            <SelectTrigger id="selectType">
              <SelectValue placeholder="Choose a blueprint type" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(ContentBlockType).map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 divide-y">
          <h4>Schema</h4>

          {Object.entries(schema).map(([name, value]) => (
            <div key={name} className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-2">
                <h5>{name}</h5>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setSchema((old) => omit(old, name))}
                >
                  Delete Field
                </Button>
              </div>

              <EditSchemaEntryComponent
                setNewValueType={(newValueType) => {
                  const newValue: Record<string, unknown> = {
                    type: newValueType,
                    optional: value.optional,
                  };

                  if (newValueType === "array") {
                    newValue.itemType = {
                      type: "string",
                    };
                  }

                  setSchema({
                    ...schema,
                    [name]: newValue as ContentBlockBlueprintSchemaValue,
                  });
                }}
                setOptional={(optional) =>
                  setSchema({
                    ...schema,
                    [name]: { ...value, optional },
                  })
                }
                setAttribute={(attribute, attributeValue) =>
                  setSchema({
                    ...schema,
                    [name]: {
                      ...value,
                      [attribute]: attributeValue,
                    } as ContentBlockBlueprintSchemaValue,
                  })
                }
                args={{
                  contentBlockBlueprints,
                }}
                value={value}
              />
            </div>
          ))}

          <div className="flex items-center gap-4 p-2">
            <Input
              value={newFieldInputValue}
              onChange={(e) => setNewFieldInputValue(e.target.value)}
              placeholder="Field Name"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newFieldName = newFieldInputValue.trim();
                if (newFieldName === "" || newFieldName in schema) return;
                setSchema({
                  ...schema,
                  [newFieldName]: {
                    type: "string",
                    optional: false,
                  } as ContentBlockBlueprintSchemaValue & {
                    optional?: boolean;
                  },
                });
                setNewFieldInputValue("");
              }}
            >
              Add Field
            </Button>
          </div>
        </div>

        <input name="schema" type="hidden" value={JSON.stringify(schema)} />

        <Button type="submit">
          {blueprint ? "Save Blueprint" : "Create Blueprint"}
        </Button>
      </Form>
    </div>
  );
};

export default ProjectPageBlueprintEdit;
