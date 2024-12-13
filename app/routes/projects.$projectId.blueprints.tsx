import { ContentBlockBlueprint } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Edit } from "lucide-react";
import { useEffect } from "react";

import { TypographyH3, TypographyH4 } from "~/components/typography";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ContentBlockBlueprintSchema,
  getAllContentBlockBlueprintsForProjectAndUser,
  getDisplayNameForContentBlockBlueprintSchemaValue,
} from "~/models/contentBlockBlueprint";
import { requireUserId } from "~/session.server";
import groupBy from "~/utils/group";
import { invariantFieldRequired } from "~/utils/invariant";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);
  const blueprints = await getAllContentBlockBlueprintsForProjectAndUser(
    projectId,
    userId,
  );
  return { blueprints };
};

const ProjectPageBlueprints = () => {
  const { blueprints } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Blueprints</TypographyH3>
      <div className="flex flex-col gap-4 divide-y py-4">
        {Array.from(groupBy(blueprints, (b) => b.type).entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([blueprintType, blueprints]) => (
            <div key={blueprintType} className="flex flex-col gap-2">
              <TypographyH4>{blueprintType}</TypographyH4>
              {blueprints.map((blueprint) => (
                <Card id={blueprint.id} key={blueprint.id}>
                  <CardHeader className="p-4">
                    <CardTitle>{blueprint.name}</CardTitle>
                    <CardDescription>{blueprint.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      {Object.entries(
                        blueprint.schema as ContentBlockBlueprintSchema,
                      ).map(([name, valueType]) => (
                        <div
                          className="flex items-center gap-1 text-sm"
                          key={name}
                        >
                          {name}
                          <Badge
                            style={{
                              backgroundColor: {
                                string: "blue",
                                number: "red",
                                array: "green",
                                block: "yellow",
                                "blueprint-block": "purple",
                              }[valueType.type],
                            }}
                          >
                            {getDisplayNameForContentBlockBlueprintSchemaValue(
                              valueType,
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`../blueprintEdit/${blueprint.id}`}>
                          <Edit />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
      </div>
      <Button variant="link" asChild>
        <Link to="../blueprintEdit">New Blueprint</Link>
      </Button>
    </div>
  );
};

export default ProjectPageBlueprints;
