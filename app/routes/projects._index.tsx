import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, NavLink, useLoaderData } from "@remix-run/react";

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
    <div className="flex h-full min-h-screen flex-col">
      <header className="bg-primary flex items-center justify-between p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Projects</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-[#D66853]"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>

          <hr />

          {userProjects.length === 0 ? (
            <p className="p-4">No projects yet</p>
          ) : (
            <ol>
              {userProjects.map((project) => (
                <li key={project.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={project.id}
                  >
                    📝 {project.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/*<div className="flex-1 p-6">
          <Outlet />
        </div>*/}
      </main>
    </div>
  );
};

export default ProjectsPage;