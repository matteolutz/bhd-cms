import { Project, ProjectAccessToken, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Project } from "@prisma/client";

export const getProjectById = (id: Project["id"]): Promise<Project | null> =>
  prisma.project.findUnique({ where: { id } });

export const getProjectByIdForUserId = (
  id: Project["id"],
  userId: User["id"],
): Promise<Project | null> =>
  prisma.project.findFirst({ where: { id, userId } });

export const getProjectsForUserId = (userId: User["id"]): Promise<Project[]> =>
  prisma.project.findMany({ where: { userId } });

export const createProject = (title: string, userId: string) =>
  prisma.project.create({
    data: {
      title,
      userId,
    },
  });

export const getProjectAccessToken = (
  projectId: string,
  userId: string,
): Promise<string | null> =>
  prisma.project
    .findUnique({
      where: { id: projectId, userId },
      include: { projectAccessToken: true },
    })
    .then((project) => project?.projectAccessToken[0].token ?? null);

export const createProjectAccessToken = (
  projectId: string,
): Promise<ProjectAccessToken> =>
  prisma.projectAccessToken.create({
    data: {
      projectId,
    },
  });
