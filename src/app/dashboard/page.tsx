import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { TaskDashboard } from "@/components/task-dashboard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const tasks = await prisma.task.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, description: true, completed: true, createdAt: true } });
  return <TaskDashboard name={session.user.name} tasks={tasks} />;
}
