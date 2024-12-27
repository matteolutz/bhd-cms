import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import BetaBadge from "~/components/betaBadge";
import {
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyP,
} from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  createProjectAccessToken,
  deleteProjectAccessToken,
  getProjectAccessTokenForUserId,
  getProjectByIdForUserId,
  ProjectSettings,
  updateProjectSettings,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";

const INTENT_GENERATE_ACCESS = "GENERATE_ACCESS";
const INTENT_DELETE_ACCESS = "DELETE_ACCESS";
const INTENT_ENABLE_LIVE_EDIT = "ENABLE_LIVE_EDIT";
const INTENT_DISABLE_LIVE_EDIT = "DISABLE_LIVE_EDIT";
const INTENT_UPDATE_LIVE_EDIT_URL = "UPDATE_LIVE_EDIT_URL";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const projectAndAccesToken = await getProjectAccessTokenForUserId(
    projectId ?? "",
    userId,
  );

  if (!projectAndAccesToken) throw new Error("Project not found!");

  const [project, accessToken] = projectAndAccesToken;

  return { project, accessToken };
};

export const action = async ({
  request,
  params: { projectId },
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId ?? "", userId);
  if (!project) return { error: "Project not found!" };

  const formData = await request.formData();

  const projectSettings = project.settings as ProjectSettings;

  const intent = formData.get("intent");
  switch (intent) {
    case INTENT_GENERATE_ACCESS: {
      return createProjectAccessToken(project.id);
    }
    case INTENT_DELETE_ACCESS: {
      return deleteProjectAccessToken(project.id);
    }
    case INTENT_ENABLE_LIVE_EDIT: {
      if (projectSettings.liveEdit.enabled) break;
      return updateProjectSettings(project.id, {
        ...projectSettings,
        liveEdit: { enabled: true, url: "https://example.com" },
      });
    }
    case INTENT_DISABLE_LIVE_EDIT: {
      if (!projectSettings.liveEdit.enabled) break;
      return updateProjectSettings(project.id, {
        ...projectSettings,
        liveEdit: { enabled: false },
      });
    }
    case INTENT_UPDATE_LIVE_EDIT_URL: {
      if (!projectSettings.liveEdit.enabled) break;
      const url = formData.get("url") as string;
      return updateProjectSettings(project.id, {
        ...projectSettings,
        liveEdit: { enabled: true, url },
      });
    }
  }
};

const ProjectPageSettings = () => {
  const { project, accessToken } = useLoaderData<typeof loader>();

  const projectSettings = project.settings as ProjectSettings;

  return (
    <div className="flex flex-col gap-4">
      <TypographyH3 className="mt-0">Settings</TypographyH3>

      <Card className="flex flex-col gap-2 p-2" id="liveEdit">
        <TypographyH4 className="flex items-center gap-2">
          Live Edit <BetaBadge />
        </TypographyH4>
        {projectSettings.liveEdit.enabled ? (
          <>
            <Form method="post" className="flex gap-2">
              <Input
                type="text"
                name="url"
                defaultValue={projectSettings.liveEdit.url}
              />
              <Button
                type="submit"
                name="intent"
                value={INTENT_UPDATE_LIVE_EDIT_URL}
              >
                Update Live-Edit URL
              </Button>
            </Form>
            <Form method="post">
              <Button
                type="submit"
                name="intent"
                value={INTENT_DISABLE_LIVE_EDIT}
                variant="destructive"
              >
                Disable Live-Edit
              </Button>
            </Form>
          </>
        ) : (
          <Form method="post">
            <Button type="submit" name="intent" value={INTENT_ENABLE_LIVE_EDIT}>
              Enable Live-Edit
            </Button>
          </Form>
        )}
      </Card>

      <Card className="flex flex-col gap-2 p-2" id="accessToken">
        <TypographyH4>Access Token</TypographyH4>
        <div className="flex items-center gap-2">
          {accessToken ? (
            <>
              <TypographyInlineCode className="h-fit w-fit">
                {accessToken}
              </TypographyInlineCode>
              <Form method="post">
                <Button
                  type="submit"
                  variant="destructive"
                  name="intent"
                  value={INTENT_DELETE_ACCESS}
                >
                  Delete Access Token
                </Button>
              </Form>
            </>
          ) : (
            <>
              <TypographyP>No access token generated yet.</TypographyP>
              <Form method="post">
                <Button
                  type="submit"
                  name="intent"
                  value={INTENT_GENERATE_ACCESS}
                >
                  Generate Access Token
                </Button>
              </Form>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectPageSettings;
