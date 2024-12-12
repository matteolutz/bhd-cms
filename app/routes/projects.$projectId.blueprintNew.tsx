import { ContentBlockType } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { TypographyH3 } from "~/components/typography";
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
} from "~/models/contentBlockBlueprint";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const blueprintName = formData.get("name");
  const blueprintType = formData.get("type");
  const blueprintFields = JSON.parse(formData.get("fields") as string);

  return "hello";
};

const ProjectPageBlueprintNew = () => {
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
              <h5>{name}</h5>

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
