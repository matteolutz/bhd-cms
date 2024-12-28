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
import { useEffect, useRef, useState } from "react";
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
  getInternalAssetFilePath,
  updateAsset,
} from "~/models/asset.server";
import {
  getProjectAccessTokenForUserId,
  getProjectByIdForUserId,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { formatFileSize } from "~/utils/fileSize";
import { invariantFieldRequired } from "~/utils/invariant";
import { useSearchParam } from "~/utils/searchParams";
import * as fs from "fs/promises";
import { Card } from "~/components/ui/card";

export const loader = async ({
  request,
  params: { projectId, assetId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");
  invariantFieldRequired(assetId, "assetId");

  const userId = await requireUserId(request);
  const projectAndAccessToken = await getProjectAccessTokenForUserId(
    projectId,
    userId,
  );
  invariantFieldRequired(projectAndAccessToken, "Project");

  const [project, accessToken] = projectAndAccessToken;

  const asset = await getAssetByIdForProject(assetId, project.id);
  invariantFieldRequired(asset, "Asset");

  invariantFieldRequired(accessToken, "Access Token");

  return { asset, accessToken };
};

const ProjectPageViewAsset = () => {
  const { asset, accessToken } = useLoaderData<typeof loader>();

  const [objUrl, setObjUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/asset/${asset.id}?accessToken=${accessToken}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setObjUrl(url);
      });
  }, [asset, accessToken]);

  return (
    <div className="flex size-full flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="../assets">
            <ChevronLeft />
          </Link>
        </Button>
        <TypographyH3 className="mt-0">{asset.name}</TypographyH3>
      </div>

      {objUrl ? (
        <Card className="flex size-full items-center justify-center">
          <object className="size-full" data={objUrl}>
            <p>Download</p>
          </object>
        </Card>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProjectPageViewAsset;
