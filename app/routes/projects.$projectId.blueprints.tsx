import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import {
  Trash,
  Edit,
  ChevronsUpDown,
  Folder,
  PlusCircle,
  BookOpen,
  Cog,
  MousePointerClick,
} from "lucide-react";

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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "~/components/ui/collapsible";
import {
  ContentBlockBlueprintSchema,
  deleteContentBlockBlueprintForProjectAndUser,
  getAllContentBlockBlueprintsForProjectAndUser,
  getDisplayNameForContentBlockBlueprintSchemaValue,
} from "~/models/contentBlockBlueprint";
import {
  getProjectByIdForUserId,
  ProjectSettings,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";
import groupBy from "~/utils/group";
import { invariantFieldRequired } from "~/utils/invariant";
import { useSearchParam } from "~/utils/searchParams";
import { tagEquals } from "~/utils/tag";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId, userId);
  invariantFieldRequired(project, "Project");

  const blueprints = await getAllContentBlockBlueprintsForProjectAndUser(
    projectId,
    userId,
  );
  return { blueprints, project };
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
  const { blueprints, project } = useLoaderData<typeof loader>();

  const [colOpen, setColOpen] = useSearchParam("colOpen");
  const [_tagPath, setTagPath] = useSearchParam("tagPath");

  const tagPathParts =
    _tagPath && _tagPath.length > 0 ? _tagPath.split("/") : [];
  const tagPath = tagPathParts.join("/");

  const currentBlueprints = blueprints.filter((blueprint) =>
    tagEquals(tagPath, blueprint.tag),
  );

  const shownBlueprints = currentBlueprints.filter((blueprint) =>
    tagEquals(tagPath, blueprint.tag, true),
  );

  const blueprintDirs = Array.from(
    new Set(
      currentBlueprints
        .filter((blueprint) => !tagEquals(tagPath, blueprint.tag, true))
        .map(
          (blueprint) =>
            (blueprint.tag ?? "").split("/").slice(tagPathParts.length)[0],
        ),
    ),
  );

  if (shownBlueprints.length === 0 && blueprintDirs.length === 0) {
    setTagPath(null);
  }

  const projectSettings = project.settings as unknown as ProjectSettings;

  return (
    <div className="flex size-full flex-col gap-2 overflow-hidden">
      <TypographyH3 className="mt-0">Blueprints</TypographyH3>

      {projectSettings.betaFeatures?.includes("TAG_BROWSER") ? (
        <div className="flex size-full flex-col overflow-hidden rounded border">
          <div className="border-b p-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="javascript:void(0)"
                    onClick={setTagPath.bind(this, null)}
                  >
                    📐 Blueprints
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {tagPathParts.map((tag, index) => (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem key={index}>
                      <BreadcrumbLink
                        href="javascript:void(0)"
                        onClick={() => {
                          setTagPath(
                            tagPathParts.slice(0, index + 1).join("/"),
                          );
                        }}
                      >
                        {tag}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden p-2">
            {blueprintDirs.map((dir) => (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
              <div
                onClick={() => setTagPath([...tagPathParts, dir].join("/"))}
                key={dir}
                className="flex cursor-pointer items-center gap-4 rounded-lg bg-gray-100 p-3 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Folder className="h-4 w-4" />
                <div className="flex-1">
                  <div className="truncate text-sm font-medium">{dir}</div>
                </div>
              </div>
            ))}

            {blueprintDirs.length > 0 ? <div className="h-4" /> : null}

            {shownBlueprints.map((blueprint) => (
              <Collapsible
                key={blueprint.id}
                className="min-h-fit rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <CollapsibleTrigger className="cursor-pointer" asChild>
                  <div className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                    {
                      {
                        PAGE: <BookOpen className="h-4 w-4" />,
                        CONFIG: <Cog className="h-4 w-4" />,
                        UI_COMPONENT: <MousePointerClick className="h-4 w-4" />,
                      }[blueprint.type]
                    }
                    <div className="flex-1">
                      <div className="truncate text-sm font-medium">
                        {blueprint.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {blueprint.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="border-t px-4 py-2 text-sm">
                  <ul className="flex flex-col gap-2">
                    {Object.entries(
                      blueprint.schema as ContentBlockBlueprintSchema,
                    ).map(([name, valueType]) => (
                      <li
                        className="flex items-center gap-1 text-sm"
                        key={name}
                      >
                        <TypographyInlineCode className="text-xs font-normal">
                          {name}
                        </TypographyInlineCode>

                        <Badge
                          style={{
                            backgroundColor: {
                              string: "blue",
                              number: "red",
                              array: "green",
                              block: "blueviolet",
                              "blueprint-block": "purple",
                              markdown: "black",
                              asset: "black",
                            }[valueType.type],
                          }}
                        >
                          {getDisplayNameForContentBlockBlueprintSchemaValue(
                            valueType,
                          )}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}

            <div className="h-4" />

            <Button asChild>
              <Link to={`../blueprintEdit?tag=${tagPath}`}>
                <PlusCircle className="h-4 w-4" />
                <div className="flex-1">
                  <div className="truncate text-sm font-medium">
                    Create New Blueprint
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button variant="outline" asChild>
            <Link to="../blueprintEdit">New Blueprint</Link>
          </Button>

          <div className="flex flex-col gap-4 divide-y py-4">
            {Array.from(groupBy(blueprints, (b) => b.type).entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([blueprintType, blueprints]) => (
                <Collapsible
                  open={colOpen === blueprintType}
                  onOpenChange={(open) =>
                    setColOpen(open ? blueprintType : null)
                  }
                  key={blueprintType}
                >
                  <div className="flex w-full items-center justify-between">
                    <TypographyH4>{blueprintType}</TypographyH4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="flex flex-col gap-2">
                    {blueprints.map((blueprint) => (
                      <Card id={blueprint.id} key={blueprint.id}>
                        <CardHeader className="p-4">
                          <CardTitle>{blueprint.name}</CardTitle>
                          <CardDescription className="flex justify-between">
                            <div className="flex flex-col">
                              <span>{blueprint.id}</span>
                              {blueprint.tag ? (
                                <span>
                                  <strong>Tag: </strong>
                                  {blueprint.tag}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`../blueprintEdit/${blueprint.id}`}>
                                  <Edit />
                                </Link>
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                  >
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
                                      This action is permanent and cannot be
                                      undone. All Content-Blocks to this
                                      Blueprint will also be deleted!
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
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
                          </CardDescription>
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
                                      block: "blueviolet",
                                      "blueprint-block": "purple",
                                      markdown: "black",
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
                        </CardContent>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectPageBlueprints;
