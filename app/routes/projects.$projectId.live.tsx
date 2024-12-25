import { ContentBlock } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/session.server";
import { invariantFieldRequired } from "~/utils/invariant";

export const action = async ({
  request,
  params: { projectId },
}: ActionFunctionArgs) => {
  invariantFieldRequired(projectId, "projectId");
  const userId = await requireUserId(request);

  const formData = await request.formData();
  console.log(formData.get("dirtyFields"));

  return {};
};

const ProjectPageLive = () => {
  const url = "http://localhost:5173";

  const fetcher = useFetcher<typeof action>();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (!e || !("bhd" in e.data)) return;

      switch (e.data.type) {
        case "bhd-live-edit-save-result": {
          const dirtyFields: Record<
            ContentBlock["id"],
            Record<string, unknown>
          > = e.data.dirtyFields;

          const clientFormData = new FormData();
          clientFormData.append("dirtyFields", JSON.stringify(dirtyFields));

          fetcher.submit(clientFormData, { method: "POST" });
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
