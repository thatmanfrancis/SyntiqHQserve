import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { checkTaskLinks, taskSchema } from "@/server/tasks";

// This route gets one task with its assigned user, company and lead
// GET /api/admin/tasks/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You need to be logged in.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true } },
        lead: {
          select: {
            id: true,
            status: true,
            contact: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Task not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Fetching task failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a task. Send { status: "COMPLETED" } to complete it.
// PATCH /api/admin/tasks/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You need to be logged in.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Task not found.",
        },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => null);

    if (body === null) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "The request body must be valid JSON.",
        },
        { status: 400 },
      );
    }
    const result = taskSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const data = result.data;

    const leadId = data.leadId === undefined ? existingTask.leadId : data.leadId;
    let companyId: string | null | undefined =
      data.companyId === undefined ? existingTask.companyId : data.companyId;

    // A new lead without a company means "use the lead's company"
    if (data.leadId && data.companyId === undefined) companyId = undefined;

    const links = await checkTaskLinks(companyId, leadId, data.assignedToId);

    if (links.error) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: links.error,
        },
        { status: 400 },
      );
    }

    const justCompleted =
      data.status === "COMPLETED" && existingTask.status !== "COMPLETED";
    const reopened =
      data.status !== undefined &&
      data.status !== "COMPLETED" &&
      existingTask.status === "COMPLETED";

    let completedAt = existingTask.completedAt;
    if (justCompleted) completedAt = new Date();
    if (reopened) completedAt = null;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        leadId,
        companyId: links.companyId,
        completedAt,
      },
    });

    if (justCompleted) {
      await prisma.activityLog.create({
        data: {
          type: "TASK_COMPLETED",
          description: `Task completed: ${task.title}`,
          userId: user.id,
          companyId: task.companyId,
          leadId: task.leadId,
          metadata: { taskId: task.id },
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Updating task failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a task. The deletion is kept in the activity log.
// DELETE /api/admin/tasks/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You need to be logged in.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Task not found.",
        },
        { status: 404 },
      );
    }

    await prisma.task.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        type: "TASK_DELETED",
        description: `Task deleted: ${task.title}`,
        userId: user.id,
        companyId: task.companyId,
        leadId: task.leadId,
        metadata: { taskId: task.id },
      },
    });

    return NextResponse.json({ message: "Task deleted." });
  } catch (error) {
    console.error("Deleting task failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
