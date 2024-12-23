import { randomUUID } from "crypto";
import * as path from "path";

import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  NodeOnDiskFile,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { useRef, useState } from "react";
import Dropzone from "react-dropzone";

import { TypographyH3, TypographyInlineCode } from "~/components/typography";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  ASSET_FILE_ROOT,
  createAsset,
  getAssetByIdForProject,
  updateAsset,
} from "~/models/asset.server";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";

export const action = async ({
  request,
  params: { projectId, assetId },
}: ActionFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId, userId);
  invariantFieldRequired(project, { message: "Project not found." });

  const fileUploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      file: ({ filename }) => randomUUID() + path.extname(filename),
      directory: ASSET_FILE_ROOT,
      maxPartSize: 10 * 1024 * 1024, // 10mb
    }),
    unstable_createMemoryUploadHandler(),
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    fileUploadHandler,
  );

  const assetName = formData.get("name") as string | null;

  let assetTag = (formData.get("tag") as string | null)?.trim() ?? null;
  assetTag = assetTag === "" ? null : assetTag;

  const assetFile = formData.get("file") as NodeOnDiskFile | null;

  console.log({ assetName, assetTag, assetFile });

  if (!assetName || assetName.trim() === "" || (!assetId && !assetFile))
    return { status: "error", reason: "Invalid parameters." };

  if (assetId) {
    const asset = await getAssetByIdForProject(assetId, project.id);
    if (!asset) return { status: "error", reason: "Asset not found." };

    await updateAsset(asset.id, assetName, assetTag);
    return redirect("../assets");
  }

  await createAsset(
    assetName,
    assetTag,
    assetFile!.name,
    assetFile!.type,
    project.id,
  );

  return redirect("../assets");
};

export const loader = async ({
  request,
  params: { projectId, assetId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId, userId);
  invariantFieldRequired(project, { message: "Project not found." });

  let asset = null;
  if (assetId) {
    asset = await getAssetByIdForProject(assetId, project.id);
  }

  return { asset };
};

const ProjectPageEditAsset = () => {
  const { asset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [assetName, setAssetName] = useState<string>(asset?.name ?? "");
  const [assetTag, setAssetTag] = useState<string>(asset?.tag ?? "");

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (incomingFiles: File[]) => {
    if (!hiddenInputRef.current) return;
    if (incomingFiles.length === 0) return;

    const file = incomingFiles[0];

    if (assetName.trim() === "") {
      setAssetName(file.name);
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    hiddenInputRef.current.files = dataTransfer.files;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="../assets">
            <ChevronLeft />
          </Link>
        </Button>
        <TypographyH3 className="mt-0">
          {asset ? `Edit Asset "${asset.name}"` : "New Asset"}
        </TypographyH3>
      </div>

      {actionData?.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{actionData.reason}</AlertDescription>
        </Alert>
      ) : null}

      <Form
        className="flex flex-col gap-8 p-2"
        method="post"
        encType="multipart/form-data"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="inputName">Name</Label>
          <Input
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            id="inputName"
            name="name"
            type="text"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="inputTag">Tag (optional)</Label>
          <Input
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
            id="inputTag"
            name="tag"
            type="text"
          />
        </div>

        {!asset ? (
          <>
            <Dropzone onDrop={handleFileDrop} maxFiles={1}>
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                acceptedFiles,
              }) => (
                <div
                  {...getRootProps({
                    className:
                      "flex flex-col w-full items-center justify-center rounded border-2 p-12 text-centeru",
                  })}
                >
                  <input {...getInputProps()} />
                  {acceptedFiles.length > 0 ? (
                    acceptedFiles.map((file) => (
                      <div key={file.name}>
                        <TypographyInlineCode>
                          {file.name} - {file.size} bytes
                        </TypographyInlineCode>
                      </div>
                    ))
                  ) : (
                    <p>
                      {!isDragActive
                        ? "Drag n drop some files here, or click to select files"
                        : "Drop files..."}
                    </p>
                  )}
                </div>
              )}
            </Dropzone>

            <input
              type="file"
              name="file"
              multiple={false}
              className="hidden"
              ref={hiddenInputRef}
              required
            />
          </>
        ) : null}

        <Button type="submit">{asset ? "Save Asset" : "Create Asset"}</Button>
      </Form>
    </div>
  );
};

export default ProjectPageEditAsset;
