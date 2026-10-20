"use client";

import { FormEvent, useState, useTransition } from "react";
import { createTask, deleteTask, setTaskCompleted, updateTask } from "@/app/actions";
import { authClient } from "@/lib/auth-client";

export type Task = { id: string; title: string; description: string | null; completed: boolean; createdAt: Date };

export function TaskDashboard({ name, tasks }: { name: string; tasks: Task[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const completed = tasks.filter((task) => task.completed).length;

  function run(action: () => Promise<{ error?: string }>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else onSuccess?.();
    });
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(() => createTask({ title, description }), () => { setTitle(""); setDescription(""); });
  }

  function saveTask(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    run(() => updateTask({ id, title: editTitle, description: editDescription }), () => setEditingId(null));
  }

  async function logout() {
    await authClient.signOut();
    window.location.assign("/login");
  }

  return <main className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6"><div><p className="text-lg font-bold tracking-tight text-slate-900">Taskflow</p><p className="text-sm text-slate-500">Hello, {name}</p></div><button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Log out</button></div></header>
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-3"><Summary label="Total tasks" value={tasks.length} /><Summary label="Completed" value={completed} /><Summary label="Pending" value={tasks.length - completed} /></div>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h1 className="text-xl font-semibold text-slate-900">Add a task</h1><form onSubmit={addTask} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><div className="space-y-3"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be done?" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" maxLength={120} required /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" maxLength={1000} /></div><button disabled={isPending} className="h-11 rounded-lg bg-blue-700 px-5 font-medium text-white hover:bg-blue-800 disabled:opacity-60">{isPending ? "Saving…" : "Add task"}</button></form>{error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}</section>
      <section className="mt-8"><div className="flex items-baseline justify-between"><h2 className="text-xl font-semibold text-slate-900">Your tasks</h2><span className="text-sm text-slate-500">{tasks.length} total</span></div>{tasks.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="font-medium text-slate-800">No tasks yet</p><p className="mt-1 text-sm text-slate-500">Add your first task above to get started.</p></div> : <ul className="mt-4 space-y-3">{tasks.map((task) => <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{editingId === task.id ? <form onSubmit={(event) => saveTask(event, task.id)} className="space-y-3"><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" maxLength={120} required /><textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2" maxLength={1000} /><div className="flex gap-2"><button disabled={isPending} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">Save</button><button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Cancel</button></div></form> : <div className="flex gap-3"><input aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`} type="checkbox" checked={task.completed} disabled={isPending} onChange={() => run(() => setTaskCompleted({ id: task.id, completed: !task.completed }))} className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-700 focus:ring-blue-600" /><div className="min-w-0 flex-1"><p className={`font-medium ${task.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>{task.title}</p>{task.description && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>}<p className="mt-2 text-xs text-slate-400">Created {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(task.createdAt))}</p></div><div className="flex shrink-0 gap-2"><button onClick={() => { setEditingId(task.id); setEditTitle(task.title); setEditDescription(task.description ?? ""); }} className="text-sm font-medium text-blue-700 hover:underline">Edit</button><button onClick={() => { if (window.confirm(`Delete “${task.title}”? This cannot be undone.`)) run(() => deleteTask(task.id)); }} className="text-sm font-medium text-red-700 hover:underline">Delete</button></div></div>}</li>)}</ul>}</section>
    </div>
  </main>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p></div>;
}
