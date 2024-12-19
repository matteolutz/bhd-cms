import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import { Trash, Edit } from "lucide-react";

import {
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
} from "~/components/typography";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ContentBlockBlueprintSchema,
  deleteContentBlockBlueprintForProjectAndUser,
  getAllContentBlockBlueprintsForProjectAndUser,
  getDisplayNameForContentBlockBlueprintSchemaValue,
} from "~/models/contentBlockBlueprint";
import { requireUserId } from "~/session.server";
import groupBy from "~/utils/group";
import { invariantFieldRequired } from "~/utils/invariant";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);
  const blueprints = await getAllContentBlockBlueprintsForProjectAndUser(
    projectId,
    userId,
  );
  return { blueprints };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  switch (request.method) {
    case "DELETE": {
      const blueprintId = formData.get("blueprintId");
      const userId = await requireUserId(request);
      await deleteContentBlockBlueprintForProjectAndUser(
        blueprintId as string,
        userId,
      );
      break;
    }
  }

  return null;
};

const ProjectPageBlueprints = () => {
  const { blueprints } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Blueprints</TypographyH3>
      <div className="flex flex-col gap-4 divide-y py-4">
        {Array.from(groupBy(blueprints, (b) => b.type).entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([blueprintType, blueprints]) => (
            <div key={blueprintType} className="flex flex-col gap-2">
              <TypographyH4>{blueprintType}</TypographyH4>
              {blueprints.map((blueprint) => (
                <Card id={blueprint.id} key={blueprint.id}>
                  <CardHeader className="p-4">
                    <CardTitle>{blueprint.name}</CardTitle>
                    <CardDescription>{blueprint.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      {Object.entries(
                        blueprint.schema as ContentBlockBlueprintSchema,
                      ).map(([name, valueType]) => (
                        <div
                          className="flex items-center gap-1 text-sm"
                          key={name}
                        >
                          {name}
                          <Badge
                            style={{
                              backgroundColor: {
                                string: "blue",
                                number: "red",
                                array: "green",
                                block: "yellow",
                                "blueprint-block": "purple",
                              }[valueType.type],
                            }}
                          >
                            {getDisplayNameForContentBlockBlueprintSchemaValue(
                              valueType,
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`../blueprintEdit/${blueprint.id}`}>
                          <Edit />
                        </Link>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" type="button">
                            <Trash />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Blueprint{" "}
                              <TypographyInlineCode>
                                {blueprint.name}
                              </TypographyInlineCode>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is permanent and cannot be undone. All
                              Content-Blocks to this Blueprint will also be
                              deleted!
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Form method="DELETE">
                              <input
                                type="hidden"
                                name="blueprintId"
                                value={blueprint.id}
                              />
                              <AlertDialogAction type="submit">
                                Delete
                              </AlertDialogAction>
                            </Form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
      </div>
      <Button variant="link" asChild>
        <Link to="../blueprintEdit">New Blueprint</Link>
      </Button>
    </div>
  );
};

export default ProjectPageBlueprints;
