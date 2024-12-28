import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { getAssetByIdForProject } from "~/models/asset.server";
import { getProjectAccessTokenForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";
import { useGoBack } from "~/utils/navigate";

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

  const goBack = useGoBack();

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
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ChevronLeft />
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
