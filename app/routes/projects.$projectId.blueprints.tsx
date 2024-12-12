import { Link } from "@remix-run/react";
import { TypographyH3 } from "~/components/typography";
import { Button } from "~/components/ui/button";

const ProjectPageBlueprints = () => {
  return (
    <div className="flex flex-col gap-2">
      <TypographyH3 className="mt-0">Blueprints</TypographyH3>
      <Button variant="link" asChild>
        <Link to="../blueprintNew">New Blueprint</Link>
      </Button>
    </div>
  );
};

export default ProjectPageBlueprints;
