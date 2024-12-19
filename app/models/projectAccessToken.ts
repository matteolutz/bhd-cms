import { ProjectAccessToken } from "@prisma/client";

import { prisma } from "~/db.server";
import { invariantFieldRequired } from "~/utils/invariant";

import { getProjectById, Project } from "./project.server";

export const getProjectIdFromAccessToken = async (
  token: ProjectAccessToken["token"],
): Promise<Project["id"] | null> =>
  prisma.projectAccessToken
    .findUnique({ where: { token } })
    .then((token) => token?.projectId ?? null);

export const requireProjectAccessToken = async (
  request: Request,
): Promise<Project> => {
  const authorizationHeader = request.headers.get("Authorization");

  invariantFieldRequired(authorizationHeader, "Authorization-Header");

  const accessToken = /^Bearer\s(.*)$/.exec(authorizationHeader);
  invariantFieldRequired(accessToken, "Authorization: Bearer <token>");

  const projectId = await getProjectIdFromAccessToken(accessToken[1]);

  invariantFieldRequired(projectId, { message: "Project not found." });

  const project = await getProjectById(projectId);

  invariantFieldRequired(project, { message: "Project not found." });

  return project;
};
