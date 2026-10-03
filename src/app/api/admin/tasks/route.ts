import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { TaskPriority, TaskStatus, TaskType } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { checkTaskLinks, taskSchema } from "@/server/tasks";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.union([z.enum(TaskStatus), z.literal("open")]).optional(),
  priority: z.enum(TaskPriority).optional(),
  type: z.enum(TaskType).optional(),
  assignedTo: z.string().optional(),
  companyId: z.string().optional(),
  leadId: z.string().optional(),
  due: z.enum(["today", "overdue", "upcoming", "none"]).optional(),
  sort: z.enum(["due", "newest", "updated", "priority"]).default("due"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const sortOptions = {
  due: { dueAt: { sort: "asc", nulls: "last" } },
  newest: { createdAt: "desc" },
  updated: { updatedAt: "desc" },
  priority: { priority: "desc" },
} satisfies Record<string, Prisma.TaskOrderByWithRelationInput>;

// This route lists tasks with filters. Use status=open for pending and in-progress tasks only.
// GET /api/admin/tasks?search=&status=(PENDING|IN_PROGRESS|COMPLETED|CANCELLED|open)&priority=&type=&assignedTo=(userId|me|unassigned)&companyId=&leadId=&due=(today|overdue|upcoming|none)&sort=(due|newest|updated|priority)&page=&pageSize=
export async function GET(request: NextRequest) {
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

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = listQuerySchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const query = result.data;

    let assignedToId: string | null | undefined = undefined;
    if (query.assignedTo === "me") assignedToId = user.id;
    else if (query.assignedTo === "unassigned") assignedToId = null;
    else if (query.assignedTo) assignedToId = query.assignedTo;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let dueAt: Prisma.DateTimeNullableFilter | null | undefined = undefined;
    if (query.due === "today") dueAt = { gte: startOfToday, lte: endOfToday };
    else if (query.due === "overdue") dueAt = { lt: startOfToday };
    else if (query.due === "upcoming") dueAt = { gt: endOfToday };
    else if (query.due === "none") dueAt = null;

    let status: Prisma.TaskWhereInput["status"] = undefined;
    if (query.status === "open") status = { in: ["PENDING", "IN_PROGRESS"] };
    else if (query.status) status = query.status;

    const where: Prisma.TaskWhereInput = {
      status,
      priority: query.priority,
      type: query.type,
      assignedToId,
      companyId: query.companyId,
      leadId: query.leadId,
      dueAt,
      title: query.search
        ? { contains: query.search, mode: "insensitive" }
        : undefined,
      OR: [{ companyId: null }, { company: { archivedAt: null } }],
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: sortOptions[query.sort],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          company: { select: { id: true, name: true } },
          lead: { select: { id: true, status: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing tasks failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route creates a task. It's assigned to you unless you pick someone else.
// If you link a lead, the task is linked to the lead's company too.
// POST /api/admin/tasks
export async function POST(request: NextRequest) {
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
    const result = taskSchema.safeParse(body);

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

    const assignedToId =
      data.assignedToId === undefined ? user.id : data.assignedToId;

    const links = await checkTaskLinks(
      data.companyId,
      data.leadId,
      assignedToId,
    );

    if (links.error) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: links.error,
        },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        assignedToId,
        companyId: links.companyId,
        completedAt: data.status === "COMPLETED" ? new Date() : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "TASK_CREATED",
        description: `Task created: ${task.title}`,
        userId: user.id,
        companyId: task.companyId,
        leadId: task.leadId,
        metadata: { taskId: task.id },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Creating task failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
