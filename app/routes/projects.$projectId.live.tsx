import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import BetaBadge from "~/components/betaBadge";
import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  getProjectByIdForUserId,
  ProjectSettings,
} from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { useKeyDownListener } from "~/utils/dom";
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

const ProjectPageLive = () => {
  const { project } = useLoaderData<typeof loader>();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedField, setSelectedField] = useState<{
    blockId: string;
    fieldName: string;
  } | null>(null);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (!e || !("bhd" in e.data)) return;

      switch (e.data.type) {
        case "bhd-internal-live-edit-save": {
          iframeRef.current?.contentWindow?.postMessage(
            { bhd: true, type: "bhd-live-edit-reload" },
            "*",
          );
          break;
        }
        case "bhd-ready": {
          iframeRef.current?.contentWindow?.postMessage(
            { bhd: true, type: "bhd-live-edit" },
            "*",
          );
          break;
        }
        case "bhd-live-edit-field-click": {
          setSelectedField(e.data.field);
          break;
        }
      }
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  useKeyDownListener((e) => e.key === "Escape" && setSelectedField(null));

  const projectSettings = project.settings as unknown as ProjectSettings;

  return (
    <div className="flex size-full flex-col gap-2">
      <div className="flex flex-col">
        <TypographyH3 className="mt-0 flex items-center gap-2">
          Live-Edit <BetaBadge />
        </TypographyH3>
        <p className="text-sm text-muted-foreground">
          Live-Edit is an experimental feature that allows you to edit your
          content directly on your website. This feature is still in beta and
          may not be fully functional or stable.
        </p>
      </div>

      {projectSettings.liveEdit.enabled ? (
        <ResizablePanelGroup
          className="size-full rounded border shadow"
          direction="horizontal"
        >
          <ResizablePanel className="p-2">
            <iframe
              className="size-full"
              src={projectSettings.liveEdit.url}
              ref={iframeRef}
              title="Live-Edit Iframe"
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="flex flex-col p-2"
            defaultSize={25}
            minSize={10}
          >
            {selectedField ? (
              <>
                <div className="flex w-full items-center justify-between">
                  <TypographyH3 className="m-0">
                    Edit Field &quot;{selectedField.fieldName}&quot;
                  </TypographyH3>
                  <Button
                    onClick={setSelectedField.bind(this, null)}
                    type="button"
                    variant="ghost"
                    size="icon"
                  >
                    <X />
                  </Button>
                </div>
                <iframe
                  title="Test"
                  src={`/projects/${project.id}/blockEdit/${selectedField.blockId}?frame=true&field=${selectedField.fieldName}#field-${selectedField.fieldName}`}
                  className="size-full"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a field to edit.
              </p>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
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
