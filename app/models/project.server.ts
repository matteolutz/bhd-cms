import { Project, ProjectAccessToken, User } from "@prisma/client";

import { prisma } from "~/db.server";
import { ContentBlockBlueprintSchema } from "./contentBlockBlueprint";

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

export const createProject = async (
  title: string,
  userId: string,
): Promise<Project> => {
  const project = await prisma.project.create({
    data: {
      title,
      userId,
    },
  });

  // create default blueprints
  const basicPageBlueprint = await prisma.contentBlockBlueprint.create({
    data: {
      projectId: project.id,
      type: "PAGE",
      name: "Basic Page",
      schema: {
        children: { type: "array", itemType: { type: "block" } },
      } satisfies ContentBlockBlueprintSchema,
    },
  });

  // create default block
  await prisma.contentBlock.create({
    data: {
      name: "Home",
      content: {
        children: [],
      },
      contentBlockBlueprintId: basicPageBlueprint.id,
    },
  });

  return project;
};

export const getProjectAccessToken = (
  projectId: Project["id"],
  userId: User["id"],
): Promise<string | null> =>
  prisma.project
    .findUnique({
      where: { id: projectId, userId },
      include: { projectAccessToken: true },
    })
    .then((project) => project?.projectAccessToken[0]?.token ?? null);

export const createProjectAccessToken = (
  projectId: Project["id"],
): Promise<ProjectAccessToken> =>
  prisma.projectAccessToken.create({
    data: {
      projectId,
    },
  });

export const deleteProjectAccessToken = (
  projectId: Project["id"],
): Promise<ProjectAccessToken> =>
  prisma.projectAccessToken.delete({
    where: {
      projectId,
    },
  });
