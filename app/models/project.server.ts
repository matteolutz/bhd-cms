import { Project, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Project } from "@prisma/client";

export const getProjectById = (id: Project["id"]): Promise<Project | null> =>
  prisma.project.findUnique({ where: { id } });

export const getProjectsForUserId = (
  userId: User["id"],
): Promise<Project[]> => prisma.project.findMany({ where: { userId } });
