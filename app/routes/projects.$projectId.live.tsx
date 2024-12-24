import { useRef } from "react";

import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";

const ProjectPageLive = () => {
  const url = "http://localhost:5173";

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const onIframeLoad = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    const iframeWindow = iframeRef.current.contentWindow;

    console.log("sending message");
    iframeWindow.postMessage({ bhd: true, type: "bhd-live-edit" }, "*");
    window.addEventListener(
      "message",
      (e) => "bhd" in e.data && console.log(e.data),
    );
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
          console.log("sending");
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
