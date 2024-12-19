import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
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

  return {};
};

const ProjectPageAssets = () => {
  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Assets</TypographyH3>

      <Button variant="link" asChild>
        <Link to="../assetEdit">New Asset</Link>
      </Button>
    </div>
  );
};

export default ProjectPageAssets;
