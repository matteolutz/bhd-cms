import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { Edit, Trash } from "lucide-react";

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
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  deleteAssetByIdForProjectAndUser,
  getAllAssetsForProject,
} from "~/models/asset.server";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";


export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId, userId);
  invariantFieldRequired(project, { message: "Project not found." });

  const assets = await getAllAssetsForProject(project.id);
  return { assets };
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
  const { assets } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Assets</TypographyH3>

      <Button variant="outline" asChild>
        <Link to="../assetEdit">New Asset</Link>
      </Button>

      <div className="flex flex-col gap-2">
        {assets.map((asset) => (
          <Card id={asset.id} key={asset.id}>
            <CardHeader className="p-4">
              <CardTitle>{asset.name}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Badge>{asset.mimeType}</Badge>
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
                          Delete Content-Block{" "}
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
    </div>
  );
};

export default ProjectPageAssets;
