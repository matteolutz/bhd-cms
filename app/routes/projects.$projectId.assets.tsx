import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Edit,
  ExternalLink,
  File,
  FileAudio,
  FileText,
  Folder,
  Image,
  PlusCircle,
  Trash,
  Video,
} from "lucide-react";

import { TypographyH3, TypographyInlineCode } from "~/components/typography";
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
  deleteAssetByIdForProjectAndUser,
  getAllAssetsForProject,
} from "~/models/asset.server";
import {
  getProjectByIdForUserId,
  ProjectSettings,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";
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

  const assets = await getAllAssetsForProject(project.id);
  return { project, assets };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  switch (request.method) {
    case "DELETE": {
      const assetId = formData.get("assetId");

      const userId = await requireUserId(request);

      await deleteAssetByIdForProjectAndUser(assetId as string, userId);
      break;
    }
  }

  return null;
};

const ProjectPageAssets = () => {
  const { project, assets } = useLoaderData<typeof loader>();

  const projectSettings = project.settings as unknown as ProjectSettings;

  const [_tagPath, setTagPath] = useSearchParam("tagPath");

  const tagPathParts =
    _tagPath && _tagPath.length > 0 ? _tagPath.split("/") : [];
  const tagPath = tagPathParts.join("/");

  const currentAssets = assets.filter((asset) => tagEquals(tagPath, asset.tag));

  const shownAssets = currentAssets.filter((asset) =>
    tagEquals(tagPath, asset.tag, true),
  );

  const assetDirs = Array.from(
    new Set(
      currentAssets
        .filter((asset) => !tagEquals(tagPath, asset.tag, true))
        .map(
          (asset) => (asset.tag ?? "").split("/").slice(tagPathParts.length)[0],
        ),
    ),
  );

  if (shownAssets.length === 0 && assetDirs.length === 0) {
    setTagPath(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Assets</TypographyH3>

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
                    ⛰ Assets
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
            {assetDirs.map((dir) => (
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

            {assetDirs.length > 0 ? <div className="h-4" /> : null}

            {shownAssets.map((asset) => (
              <Collapsible
                key={asset.id}
                className="min-h-fit overflow-x-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <CollapsibleTrigger className="cursor-pointer" asChild>
                  <div className="flex w-full items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                    {
                      {
                        IMAGE: <Image className="h-4 w-4" />,
                        VIDEO: <Video className="h-4 w-4" />,
                        AUDIO: <FileAudio className="h-4 w-4" />,
                        DOCUMENT: <FileText className="h-4 w-4" />,
                        OTHER: <File className="h-4 w-4" />,
                      }[asset.assetType]
                    }
                    <div className="flex-1">
                      <div className="truncate text-sm font-medium">
                        {asset.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {asset.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`../assetView/${asset.id}`}>
                          <ExternalLink />
                        </Link>
                      </Button>

                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`../assetEdit/${asset.id}`}>
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
                              Delete Asset{" "}
                              <TypographyInlineCode>
                                {asset.name}
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
                                name="assetId"
                                value={asset.id}
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
                  <div className="flex flex-col gap-2 p-2">
                    <div>
                      <strong>Type:</strong>{" "}
                      <TypographyInlineCode className="text-xs">
                        {asset.assetType}
                      </TypographyInlineCode>
                    </div>
                    <div>
                      <strong>MIME-Type:</strong>{" "}
                      <TypographyInlineCode className="text-xs">
                        {asset.mimeType}
                      </TypographyInlineCode>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            <div className="h-4" />

            <Button asChild>
              <Link to={`../assetEdit?tag=${tagPath}`}>
                <PlusCircle className="h-4 w-4" />
                <div className="flex-1">
                  <div className="truncate text-sm font-medium">
                    Create New Asset
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button variant="outline" asChild>
            <Link to="../assetEdit">New Asset</Link>
          </Button>

          <div className="flex flex-col gap-2">
            {assets.map((asset) => (
              <Card id={asset.id} key={asset.id}>
                <CardHeader className="p-4">
                  <CardTitle>{asset.name}</CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Badge className="h-min">{asset.mimeType}</Badge>
                      <Badge className="h-min">{asset.assetType}</Badge>
                      <Button variant="link" asChild>
                        <Link
                          target="_blank"
                          rel="noreferrer"
                          to={`/api/asset/${asset.id}`}
                        >
                          Open File
                        </Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`../assetEdit/${asset.id}`}>
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
                              Delete Asset{" "}
                              <TypographyInlineCode>
                                {asset.name}
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
                                name="assetId"
                                value={asset.id}
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
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectPageAssets;
