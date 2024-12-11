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
  getProjectAccessToken,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";

const INTENT_GENERATE_ACCESS = "GENERATE_ACCESS";

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
  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case INTENT_GENERATE_ACCESS: {
      return createProjectAccessToken(projectId ?? "");
    }
  }
};

const ProjectPageSettings = () => {
  const { accessToken } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 divide-y">
      <TypographyH3>Settings</TypographyH3>

      <div className="flex flex-col gap-2">
        <TypographyH4>Access Token</TypographyH4>
        {accessToken ? (
          <TypographyInlineCode className="w-fit">
            {accessToken}
          </TypographyInlineCode>
        ) : (
          <Form method="post">
            <TypographyP>No access token generated yet.</TypographyP>
            <Button type="submit" name="intent" value={INTENT_GENERATE_ACCESS}>
              Generate Access Token
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ProjectPageSettings;
