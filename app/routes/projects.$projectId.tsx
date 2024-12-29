import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ChevronLeft, ChevronUp, User2 } from "lucide-react";

import BetaBadge from "~/components/betaBadge";
import { TypographyH2, TypographyH3 } from "~/components/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { invariantFieldRequired } from "~/utils/invariant";
import { useSearchParam } from "~/utils/searchParams";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);
  const project = await getProjectByIdForUserId(projectId, userId);

  if (!project) return redirect("/projects");

  return { project };
};

const ProjectPageLayout = () => {
  const { project } = useLoaderData<typeof loader>();
  const user = useUser();

  const [_isIframe] = useSearchParam("frame");
  const isIframe = _isIframe === "true";

  return isIframe ? (
    <Outlet />
  ) : (
    <SidebarProvider className="h-screen w-screen">
      <Sidebar className="h-full" collapsible="offcanvas">
        <SidebarHeader>
          <TypographyH2 className="m-0 text-foreground">
            {project.title}
          </TypographyH2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/projects">
                <SidebarMenuButton>
                  <ChevronLeft /> <span>Projects</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="dashboard">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <span>🏠</span> <span>Dashboard</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="live">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <span>⚡️</span> <span>Live-Edit</span> <BetaBadge />
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="blueprints">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <span>📐</span> <span>Blueprints</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="blocks">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <span>📦</span> <span>Content Blocks</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="assets">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <span>⛰</span> <span>Assets</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="settings">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <span>⚙️</span> <span>Settings</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {user.email}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Form method="post" action="/logout">
                      <button type="submit">Logout</button>
                    </Form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex size-full flex-col gap-2 overflow-x-hidden p-4">
        <div className="flex items-center gap-2 border-b min-[768px]:hidden">
          <SidebarTrigger />
          <TypographyH3 className="m-0 text-foreground">
            {project.title}
          </TypographyH3>
        </div>
        <Outlet context={{ project }} />
      </main>
    </SidebarProvider>
  );
};

export default ProjectPageLayout;
