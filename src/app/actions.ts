"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { error?: string; success?: true };

const taskSchema = z.object({
  title: z.string().trim().min(1, "A task title is required.").max(120, "Title must be 120 characters or less."),
  description: z.string().trim().max(1_000, "Description must be 1,000 characters or less.").optional(),
});

const taskIdSchema = z.string().cuid("Invalid task.");

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

function cleanDescription(description?: string) {
  return description ? description : null;
}

export async function createTask(input: { title: string; description?: string }): Promise<ActionResult> {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid task." };

  const user = await getCurrentUser();
  await prisma.task.create({
    data: { ...parsed.data, description: cleanDescription(parsed.data.description), userId: user.id },
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(input: { id: string; title: string; description?: string }): Promise<ActionResult> {
  const parsed = taskSchema.safeParse(input);
  const id = taskIdSchema.safeParse(input.id);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid task." };
  if (!id.success) return { error: "Invalid task." };

  const user = await getCurrentUser();
  const result = await prisma.task.updateMany({
    where: { id: id.data, userId: user.id },
    data: { ...parsed.data, description: cleanDescription(parsed.data.description) },
  });
  if (result.count === 0) return { error: "Task not found." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setTaskCompleted(input: { id: string; completed: boolean }): Promise<ActionResult> {
  const id = taskIdSchema.safeParse(input.id);
  if (!id.success || typeof input.completed !== "boolean") return { error: "Invalid task." };

  const user = await getCurrentUser();
  const result = await prisma.task.updateMany({
    where: { id: id.data, userId: user.id },
    data: { completed: input.completed },
  });
  if (result.count === 0) return { error: "Task not found." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(idValue: string): Promise<ActionResult> {
  const id = taskIdSchema.safeParse(idValue);
  if (!id.success) return { error: "Invalid task." };

  const user = await getCurrentUser();
  const result = await prisma.task.deleteMany({ where: { id: id.data, userId: user.id } });
  if (result.count === 0) return { error: "Task not found." };
  revalidatePath("/dashboard");
  return { success: true };
}
