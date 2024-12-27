import { ContentBlock } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import BetaBadge from "~/components/betaBadge";
import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { updateBlockContentForProjectId } from "~/models/contentBlock.server";
import {
  getProjectByIdForUserId,
  ProjectSettings,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";

export const loader = async ({
  request,
  params: { projectId },
}: LoaderFunctionArgs) => {
  if (!projectId) invariantFieldRequired(projectId, "projectId");

  const userId = await requireUserId(request);
  const project = await getProjectByIdForUserId(projectId, userId);

  invariantFieldRequired(project, "project");

  return { project };
};

export const action = async ({
  request,
  params: { projectId },
}: ActionFunctionArgs) => {
  if (!projectId) {
    return { success: false, saved: null, error: "Project id is required." };
  }

  let userId;
  try {
    userId = await requireUserId(request);
  } catch (e) {
    return { success: false, saved: null, error: "" + e };
  }

  const project = await getProjectByIdForUserId(projectId, userId);
  if (!project) {
    return { success: false, saved: null, error: "Project not found." };
  }

  if (!(project.settings as ProjectSettings).liveEdit.enabled)
    return {
      success: false,
      saved: null,
      error: "Live-Edit is not enabled for this project.",
    };

  const formData = await request.formData();
  const dirtyFields: Record<
    ContentBlock["id"],
    Record<string, string>
  > = JSON.parse(formData.get("dirtyFields") as string);

  const numDirtyFields = Object.values(dirtyFields).reduce(
    (acc, curr) => acc + Object.keys(curr).length,
    0,
  );

  for (const blockId in dirtyFields) {
    await updateBlockContentForProjectId(
      blockId,
      project.id,
      dirtyFields[blockId],
    );
  }

  return { success: true, saved: numDirtyFields, error: null };
};

const ProjectPageLive = () => {
  const { project } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<typeof action>();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data || !fetcher.data.success)
      return;

    toast({
      description: `Successfully ${fetcher.data.saved} fields saved.`,
    });

    iframeRef.current?.contentWindow?.postMessage(
      { bhd: true, type: "bhd-live-edit-reload" },
      "*",
    );
  }, [fetcher]);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (!e || !("bhd" in e.data)) return;

      switch (e.data.type) {
        case "bhd-live-edit-save-result": {
          fetcher.submit(
            { dirtyFields: JSON.stringify(e.data.dirtyFields) },
            { method: "POST" },
          );
          break;
        }
      }
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  const onIframeLoad = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    const iframeWindow = iframeRef.current.contentWindow;

    iframeWindow.postMessage({ bhd: true, type: "bhd-live-edit" }, "*");
  };

  const projectSettings = project.settings as ProjectSettings;

  return (
    <div className="flex size-full flex-col gap-2">
      <TypographyH3 className="mt-0 flex items-center gap-2">
        Live-Edit <BetaBadge />
      </TypographyH3>
      {projectSettings.liveEdit.enabled ? (
        <>
          <iframe
            className="size-full rounded border-2 p-2 shadow-lg"
            src={projectSettings.liveEdit.url}
            ref={iframeRef}
            onLoad={onIframeLoad}
            title="Live-Edit Iframe"
          />
          <Button
            onClick={() => {
              iframeRef.current?.contentWindow?.postMessage(
                { bhd: true, type: "bhd-live-edit-save" },
                "*",
              );
            }}
            type="button"
            disabled={fetcher.state === "submitting"}
          >
            Save
          </Button>
        </>
      ) : (
        <p>
          Live-Edit is not enabled for this project. Please go to the{" "}
          <Button asChild variant="link">
            <Link to="../settings#liveEdit">Settings</Link>
          </Button>{" "}
          and enable it.
        </p>
      )}
    </div>
  );
};

export default ProjectPageLive;
