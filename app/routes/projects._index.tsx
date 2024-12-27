import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { CirclePlus } from "lucide-react";

import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
} from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { getProjectsForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const userProjects = await getProjectsForUserId(userId);

  return { userProjects };
};

const ProjectsPage = () => {
  const { userProjects } = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex size-full flex-col gap-8 p-8">
      <div className="flex flex-col gap-1">
        <TypographyH1>bhd</TypographyH1>
        <div className="flex items-center gap-2">
          <p>Welcome back, {user.email}!</p>
          <Form action="/logout" method="post">
            <Button variant="link" className="p-0" type="submit">
              Logout
            </Button>
          </Form>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <TypographyH2>Projects</TypographyH2>

        <div className="flex size-full flex-wrap gap-2">
          {userProjects.map((project) => (
            <Link
              to={project.id}
              key={project.id}
              className="transition-transform hover:scale-[101%]"
            >
              <Card className="flex h-[200px] w-[300px] items-center justify-center p-2">
                <TypographyH3 className="mt-0">{project.title}</TypographyH3>
              </Card>
            </Link>
          ))}
          <Link to="new" className="transition-transform hover:scale-[101%]">
            <Card className="flex h-[200px] w-[300px] items-center justify-center p-2">
              <TypographyH3 className="mt-0">
                <CirclePlus />
              </TypographyH3>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
