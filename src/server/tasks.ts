import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TaskPriority, TaskStatus, TaskType } from "@/generated/prisma/enums";
import { checkCompanyAndLead } from "@/server/leads";

export const taskSchema = z.object({
  title: z.string({ error: "Title is required" }).trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  type: z.enum(TaskType).optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(TaskPriority).optional(),
  dueAt: z.coerce.date().nullable().optional(),
  assignedToId: z.string().min(1).nullable().optional(),
  companyId: z.string().min(1).nullable().optional(),
  leadId: z.string().min(1).nullable().optional(),
});

// Makes sure the assigned user, company and lead exist, and that the lead belongs to the company.
// When a lead is given without a company, the company is taken from the lead.
export async function checkTaskLinks(
  companyId: string | null | undefined,
  leadId: string | null | undefined,
  assignedToId: string | null | undefined,
) {
  if (assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });
    if (!assignedUser || !assignedUser.isActive) {
      return { error: "Assigned user not found.", companyId: null };
    }
  }

  return checkCompanyAndLead(companyId, leadId);
}

// Creates a task when something happens that needs a person to act, e.g. a prospect replies.
// It goes to the lead's owner (or whoever triggered it) and is skipped if the same open task already exists.
export async function createAutoTask(task: {
  title: string;
  type: TaskType;
  priority: TaskPriority;
  dueInDays: number;
  companyId: string;
  leadId: string | null;
  userId: string;
}) {
  const lead = task.leadId
    ? await prisma.lead.findUnique({ where: { id: task.leadId } })
    : null;

  const alreadyExists = await prisma.task.findFirst({
    where: {
      title: task.title,
      companyId: task.companyId,
      leadId: task.leadId,
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
  });
  if (alreadyExists) return;

  const createdTask = await prisma.task.create({
    data: {
      title: task.title,
      type: task.type,
      priority: task.priority,
      dueAt: new Date(Date.now() + task.dueInDays * 24 * 60 * 60 * 1000),
      assignedToId: lead?.assignedToId ?? task.userId,
      companyId: task.companyId,
      leadId: task.leadId,
    },
  });

  await prisma.activityLog.create({
    data: {
      type: "TASK_CREATED",
      description: `Task created automatically: ${createdTask.title}`,
      userId: task.userId,
      companyId: task.companyId,
      leadId: task.leadId,
      metadata: { taskId: createdTask.id },
    },
  });
}
