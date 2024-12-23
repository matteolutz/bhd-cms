import { ProjectAccessToken } from "@prisma/client";

import { prisma } from "~/db.server";
import { invariantFieldRequired } from "~/utils/invariant";

import { getProjectById, Project } from "./project.server";
import { Params } from "@remix-run/react";

export const getProjectIdFromAccessToken = async (
  token: ProjectAccessToken["token"],
): Promise<Project["id"] | null> =>
  prisma.projectAccessToken
    .findUnique({ where: { token } })
    .then((token) => token?.projectId ?? null);

export const requireProjectAccessToken = async (
  request: Request,
  allowGetParam = false,
): Promise<Project> => {
  const authorizationHeader = request.headers.get("Authorization");

  let accessToken;
  if (!authorizationHeader && allowGetParam) {
    const params = new URL(request.url).searchParams;
    accessToken = params.get("accessToken");
    invariantFieldRequired(accessToken, "?accessToken=<token>");
  } else {
    invariantFieldRequired(
      authorizationHeader,
      allowGetParam
        ? 'Authorization-Header or "accessToken"-GET-Parameter'
        : "Authorization-Header",
    );

    accessToken = /^Bearer\s(.*)$/.exec(authorizationHeader);
    invariantFieldRequired(accessToken, "Authorization: Bearer <token>");
    accessToken = accessToken[1];
  }

  const projectId = await getProjectIdFromAccessToken(accessToken);

  invariantFieldRequired(projectId, { message: "Project not found." });

  const project = await getProjectById(projectId);

  invariantFieldRequired(project, { message: "Project not found." });

  return project;
};
