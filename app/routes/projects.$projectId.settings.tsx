import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import {
  TypographyH3,
  TypographyH4,
  TypographyInlineCode,
  TypographyP,
} from "~/components/typography";
import { Button } from "~/components/ui/button";
import {
  createProjectAccessToken,
  deleteProjectAccessToken,
  getProjectAccessToken,
  getProjectByIdForUserId,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";

const INTENT_GENERATE_ACCESS = "GENERATE_ACCESS";
const INTENT_DELETE_ACCESS = "DELETE_ACCESS";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const accessToken = await getProjectAccessToken(projectId ?? "", userId);
  return { accessToken };
};

export const action = async ({
  request,
  params: { projectId },
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId ?? "", userId);
  if (!project) return { error: "Project not found!" };

  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case INTENT_GENERATE_ACCESS: {
      return createProjectAccessToken(project.id);
    }
    case INTENT_DELETE_ACCESS: {
      return deleteProjectAccessToken(project.id);
    }
  }
};

const ProjectPageSettings = () => {
  const { accessToken } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 divide-y">
      <TypographyH3 className="mt-0">Settings</TypographyH3>

      <div className="flex flex-col gap-2">
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
      </div>
    </div>
  );
};

export default ProjectPageSettings;
