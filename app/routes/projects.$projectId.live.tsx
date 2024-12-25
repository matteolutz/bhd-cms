import { ContentBlock } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { updateBlockContentForProjectId } from "~/models/contentBlock.server";
import { getProjectByIdForUserId } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";

export const action = async ({
  request,
  params: { projectId },
}: ActionFunctionArgs) => {
  if (!projectId) {
    return { success: false, error: "Project id is required." };
  }

  let userId;
  try {
    userId = await requireUserId(request);
  } catch (e) {
    return { success: false, error: "" + e };
  }

  const project = await getProjectByIdForUserId(projectId, userId);
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  const formData = await request.formData();
  const dirtyFields: Record<
    ContentBlock["id"],
    Record<string, string>
  > = JSON.parse(formData.get("dirtyFields") as string);

  for (const blockId in dirtyFields) {
    await updateBlockContentForProjectId(
      blockId,
      project.id,
      dirtyFields[blockId],
    );
  }

  return { success: true, error: null };
};

const ProjectPageLive = () => {
  const url = "http://localhost:5173";

  const fetcher = useFetcher<typeof action>();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!fetcher.data || !fetcher.data.success) return;
    iframeRef.current?.contentWindow?.postMessage(
      { bhd: true, type: "bhd-live-edit-reload" },
      "*",
    );
  }, [fetcher.data]);

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

  return (
    <div className="flex size-full flex-col gap-2">
      <TypographyH3 className="mt-0">Live-Edit</TypographyH3>
      <iframe
        className="size-full rounded border-2"
        src={url}
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
      >
        Save
      </Button>
    </div>
  );
};

export default ProjectPageLive;
