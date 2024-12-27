import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";

import { TypographyH3 } from "~/components/typography";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createProject } from "~/models/project.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return { status: "error", reason: "Title is required" };
  }

  const project = await createProject(title, userId);

  return redirect(`/projects/${project.id}`);
};

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="../projects">
            <ChevronLeft />
          </Link>
        </Button>
        <TypographyH3 className="mt-0">New Project</TypographyH3>
      </div>

      {actionData?.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{actionData.reason}</AlertDescription>
        </Alert>
      ) : null}

      <Form className="flex flex-col gap-8 p-2" method="post">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inputTitle">Title</Label>
          <Input id="inputTitle" name="title" type="text" required />
        </div>

        <Button type="submit">Create Project</Button>
      </Form>
    </div>
  );
}
