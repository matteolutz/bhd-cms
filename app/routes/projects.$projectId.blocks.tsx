import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Edit } from "lucide-react";
import { TypographyH3, TypographyH4 } from "~/components/typography";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getAllContentBlocksInProject } from "~/models/contentBlock.server";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import groupBy from "~/utils/group";
import { invariantFieldRequired } from "~/utils/invariant";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);

  const project = await getProjectByIdForUserId(projectId, userId);
  invariantFieldRequired(project, { message: "Project not found." });

  const blocks = await getAllContentBlocksInProject(project.id);
  return { blocks };
};

const ProjectPageBlocks = () => {
  const { blocks } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Content Blocks</TypographyH3>

      <div className="flex flex-col gap-4 divide-y py-4">
        {Array.from(
          groupBy(blocks, (b) => b.contentBlockBlueprint.type).entries(),
        )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([blueprintType, blocks]) => (
            <div key={blueprintType} className="flex flex-col gap-2">
              <TypographyH4>{blueprintType}</TypographyH4>
              {blocks.map((block) => (
                <Card id={block.id} key={block.id}>
                  <CardHeader className="p-4">
                    <CardTitle>{block.name}</CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Badge>{block.contentBlockBlueprint.name}</Badge>
                        {block.id}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`../blockEdit/${block.id}`}>
                            <Edit />
                          </Link>
                        </Button>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ))}
      </div>

      <Button variant="link" asChild>
        <Link to="../blockEdit">New Content Block</Link>
      </Button>
    </div>
  );
};

export default ProjectPageBlocks;
