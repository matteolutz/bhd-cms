import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { Copy } from "lucide-react";

import BetaBadge from "~/components/betaBadge";
import {
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyP,
} from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { ALL_PROJECT_BETA_FEATURE_FLAGS } from "~/models/project";
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
const INTENT_UPDATE_BETA_FEATURES = "UPDATE_BETA_FEATURES";

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

  const projectSettings = project.settings as unknown as ProjectSettings;

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
    case INTENT_UPDATE_BETA_FEATURES: {
      const betaFeatures = ALL_PROJECT_BETA_FEATURE_FLAGS.filter((feature) =>
        formData.has(feature),
      );

      return updateProjectSettings(project.id, {
        ...projectSettings,
        betaFeatures,
      });
    }
  }
};

const ProjectPageSettings = () => {
  const { project, accessToken } = useLoaderData<typeof loader>();

  const projectSettings = project.settings as unknown as ProjectSettings;
  const { toast } = useToast();

  const fetcher = useFetcher<typeof action>();

  return (
    <div className="flex flex-col gap-4">
      <TypographyH3 className="mt-0">Settings</TypographyH3>

      <Card className="flex flex-col gap-2 p-4" id="accessToken">
        <TypographyH4>Access Token</TypographyH4>

        <p className="text-sm text-muted-foreground">
          This access token can be used to authenticate requests to the API. It
          does not have to be kept secret, becuase it can only be used to access
          the data of this project. Client-side libraries such as{" "}
          <Button variant="link" asChild className="m-0 h-min p-0 text-sm">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://npmjs.com/package/bhd-cms-react"
            >
              bhd-cms-react
            </a>
          </Button>{" "}
          can use this token to authenticate requests.
        </p>

        <div className="flex items-center gap-2">
          {accessToken ? (
            <>
              <TypographyInlineCode
                id="accessTokenValue"
                className="h-fit w-fit"
              >
                {accessToken}
              </TypographyInlineCode>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => {
                  const element = document.getElementById("accessTokenValue");
                  element && window.getSelection()?.selectAllChildren(element);

                  navigator.clipboard.writeText(accessToken);
                  toast({
                    description: "Access token copied to clipboard.",
                  });
                }}
              >
                <Copy />
              </Button>
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

      <Card className="flex flex-col gap-2 p-4" id="liveEdit">
        <TypographyH4 className="flex items-center gap-2">
          Live Edit <BetaBadge />
        </TypographyH4>

        <p className="text-sm text-muted-foreground">
          Live-Edit is an experimental feature that allows you to edit your
          content directly on your website. This feature is still in beta and
          may not be fully functional or stable.
        </p>

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

      <Card className="flex flex-col gap-2 p-4" id="betaFeatures">
        <TypographyH4 className="flex items-center">
          <BetaBadge />
          -Features
        </TypographyH4>

        <p className="text-sm text-muted-foreground">
          These features are still in beta and may not be fully functional or
          stable. Most of these features are just for development purposes and
          should not be used in production.
        </p>

        <fetcher.Form
          method="post"
          className="p-2"
          onChange={(e) => fetcher.submit(e.target.form)}
        >
          <input
            type="hidden"
            name="intent"
            value={INTENT_UPDATE_BETA_FEATURES}
          />
          {ALL_PROJECT_BETA_FEATURE_FLAGS.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Checkbox
                disabled={fetcher.state === "submitting"}
                name={feature}
                defaultChecked={projectSettings.betaFeatures?.includes(feature)}
              />
              <span>{feature}</span>
            </div>
          ))}
        </fetcher.Form>
      </Card>
    </div>
  );
};

export default ProjectPageSettings;
