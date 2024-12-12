import { ContentBlockType } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Delete } from "lucide-react";
import { useState } from "react";
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
  ContentBlockBlueprintSchemaValue,
  ContentBlockBlueprintSchemaValueType,
  createContentBlockBlueprint,
  getAllContentBlockBlueprintsForProjectAndUser,
} from "~/models/contentBlockBlueprint";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import omit from "~/utils/omit";

export const action = async ({
  request,
  params: { projectId },
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
  const blueprintType = formData.get("type") as ContentBlockType;
  const blueprintFields = JSON.parse(formData.get("fields") as string);

  if (
    !blueprintName ||
    blueprintName === "" ||
    !blueprintType ||
    !Object.keys(ContentBlockType).includes(blueprintType as string)
  ) {
    return { status: "error" };
  }

  await createContentBlockBlueprint(
    blueprintName,
    blueprintType,
    blueprintFields,
    project.id,
  );

  return redirect("../blueprints");
};

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  if (!projectId) throw new Error("Project id required");

  const contentBlockBlueprints =
    await getAllContentBlockBlueprintsForProjectAndUser(projectId, userId);

  return { contentBlockBlueprints };
};

const ProjectPageBlueprintNew = () => {
  const { contentBlockBlueprints } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [fields, setFields] = useState<
    Record<
      string,
      {
        value: ContentBlockBlueprintSchemaValue;
        optional: boolean;
      }
    >
  >({});

  const [newFieldInputValue, setNewFieldInputValue] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">New Blueprint</TypographyH3>

      {actionData?.status === "error" && (
        <Alert variant="destructive">Error</Alert>
      )}

      <Form className="flex flex-col gap-8 p-2" method="post">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inputName">Name</Label>
          <Input id="inputName" name="name" type="text" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="selectType">Block Type</Label>
          <Select name="type">
            <SelectTrigger id="selectType">
              <SelectValue placeholder="Choose a block type" />
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
          <h4>Fields</h4>

          {Object.entries(fields).map(([name, value]) => (
            <div key={name} className="flex flex-col gap-3 p-2">
              <div className="flex items-center gap-2">
                <h5>{name}</h5>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setFields((old) => omit(old, name))}
                >
                  Delete Field
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Select
                  onValueChange={(newValueType) =>
                    setFields({
                      ...fields,
                      [name]: {
                        ...value,
                        value: {
                          type: newValueType,
                        } as ContentBlockBlueprintSchemaValue,
                      },
                    })
                  }
                  value={value.value.type}
                >
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
                    onCheckedChange={(checked) =>
                      setFields({
                        ...fields,
                        [name]: { ...value, optional: !!checked },
                      })
                    }
                    checked={value.optional}
                  />
                </div>
              </div>
              <div>
                {
                  {
                    block: (
                      <Select
                        onValueChange={(newBlockType) =>
                          setFields({
                            ...fields,
                            [name]: {
                              ...value,
                              value: {
                                ...value.value,
                                blockType: newBlockType,
                              } as ContentBlockBlueprintSchemaValue,
                            },
                          })
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        value={value.value.blockType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Block Blueprint" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentBlockBlueprints.map((bp) => (
                            <SelectItem key={bp.id} value={bp.id}>
                              {bp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ),
                    array: null,
                    string: null,
                    number: null,
                  }[value.value.type]
                }
              </div>
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
              onClick={() => {
                if (newFieldInputValue in fields) return;
                setFields({
                  ...fields,
                  [newFieldInputValue]: {
                    value: {
                      type: "string",
                    } as ContentBlockBlueprintSchemaValue,
                    optional: false,
                  },
                });
                setNewFieldInputValue("");
              }}
            >
              Add Field
            </Button>
          </div>
        </div>

        <input name="fields" type="hidden" value={JSON.stringify(fields)} />

        <Button type="submit">Create Blueprint</Button>
      </Form>
    </div>
  );
};

export default ProjectPageBlueprintNew;
