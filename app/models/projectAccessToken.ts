import { ProjectAccessToken } from "@prisma/client";

import { prisma } from "~/db.server";

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

  if (!authorizationHeader) throw new Error("Unauthorized");

  const accessToken = /^Bearer\s(.*)$/.exec(authorizationHeader);

  if (!accessToken) throw new Error("Unauthorized");

  const projectId = await getProjectIdFromAccessToken(accessToken[1]);

  if (!projectId) throw new Error("Project not found");

  const project = await getProjectById(projectId);

  if (!project) throw new Error("Unauthorized");

  return project;
};
