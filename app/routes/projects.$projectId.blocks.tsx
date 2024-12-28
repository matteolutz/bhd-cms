import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, Form } from "@remix-run/react";
import {
  BookOpen,
  ChevronsUpDown,
  Cog,
  Edit,
  Folder,
  MousePointerClick,
  PlusCircle,
  Trash,
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  deleteContentBlockForUser,
  getAllContentBlocksInProject,
} from "~/models/contentBlock.server";
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
  invariantFieldRequired(project, { message: "Project not found." });

  const blocks = await getAllContentBlocksInProject(project.id);
  return { project, blocks };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  switch (request.method) {
    case "DELETE": {
      const blockId = formData.get("blockId");

      const userId = await requireUserId(request);

      await deleteContentBlockForUser(blockId as string, userId);
      break;
    }
  }

  return null;
};

const ProjectPageBlocks = () => {
  const { project, blocks } = useLoaderData<typeof loader>();

  const [colOpen, setColOpen] = useSearchParam("colOpen");

  const [_tagPath, setTagPath] = useSearchParam("tagPath");

  const tagPathParts =
    _tagPath && _tagPath.length > 0 ? _tagPath.split("/") : [];
  const tagPath = tagPathParts.join("/");

  const currentBlocks = blocks.filter((block) => tagEquals(tagPath, block.tag));

  const shownBlocks = currentBlocks.filter((block) =>
    tagEquals(tagPath, block.tag, true),
  );

  const blockDirs = Array.from(
    new Set(
      currentBlocks
        .filter((block) => !tagEquals(tagPath, block.tag, true))
        .map(
          (block) => (block.tag ?? "").split("/").slice(tagPathParts.length)[0],
        ),
    ),
  );

  if (shownBlocks.length === 0 && blockDirs.length === 0) {
    setTagPath(null);
  }

  const projectSettings = project.settings as unknown as ProjectSettings;

  return (
    <div className="flex size-full flex-col gap-2 overflow-hidden">
      <TypographyH3 className="mt-0">Content Blocks</TypographyH3>

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
                    📦 Content Blocks
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
            {blockDirs.map((dir) => (
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

            {blockDirs.length > 0 ? <div className="h-4" /> : null}

            {shownBlocks.map((block) => (
              <Collapsible
                key={block.id}
                className="min-h-fit overflow-x-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <CollapsibleTrigger className="cursor-pointer" asChild>
                  <div className="flex w-full items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                    {
                      {
                        PAGE: <BookOpen className="h-4 w-4" />,
                        CONFIG: <Cog className="h-4 w-4" />,
                        UI_COMPONENT: <MousePointerClick className="h-4 w-4" />,
                      }[block.contentBlockBlueprint.type]
                    }
                    <div className="flex-1">
                      <div className="truncate text-sm font-medium">
                        {block.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {block.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`../blockEdit/${block.id}`}>
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
                              Delete Content Block{" "}
                              <TypographyInlineCode>
                                {block.name}
                              </TypographyInlineCode>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is permanent and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Form method="DELETE">
                              <input
                                type="hidden"
                                name="blockId"
                                value={block.id}
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
                  <div className="mb-2 p-2">
                    <strong>Blueprint</strong>:{" "}
                    <Button className="m-0 size-fit p-0" variant="link" asChild>
                      <Link
                        to={`../blueprints?tagPath=${block.contentBlockBlueprint.tag ?? ""}`}
                      >
                        {block.contentBlockBlueprint.name}
                      </Link>
                    </Button>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {Object.entries(
                      block.content as Record<string, unknown>,
                    ).map(([name, value]) => (
                      <li
                        className="flex items-center gap-1 text-sm"
                        key={name}
                      >
                        <TypographyInlineCode className="text-xs font-normal">
                          {name}
                        </TypographyInlineCode>
                        <span className="w-full overflow-x-hidden text-ellipsis whitespace-nowrap text-xs">
                          {"" + value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}

            <div className="h-4" />

            <Button asChild>
              <Link to={`../blockEdit?tag=${tagPath}`}>
                <PlusCircle className="h-4 w-4" />
                <div className="flex-1">
                  <div className="truncate text-sm font-medium">
                    Create New Content Block
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button variant="outline" asChild>
            <Link to="../blockEdit">New Content Block</Link>
          </Button>

          <div className="flex flex-col gap-4 divide-y py-4">
            {Array.from(
              groupBy(blocks, (b) => b.contentBlockBlueprint.type).entries(),
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([blueprintType, blocks]) => (
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
                    {blocks.map((block) => (
                      <Card id={block.id} key={block.id}>
                        <CardHeader className="p-4">
                          <CardTitle>{block.name}</CardTitle>
                          <CardDescription className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Badge>{block.contentBlockBlueprint.name}</Badge>
                              {block.id}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`../blockEdit/${block.id}`}>
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
                                      Delete Content Block{" "}
                                      <TypographyInlineCode>
                                        {block.name}
                                      </TypographyInlineCode>
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action is permanent and cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <Form method="DELETE">
                                      <input
                                        type="hidden"
                                        name="blockId"
                                        value={block.id}
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

export default ProjectPageBlocks;
