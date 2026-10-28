import { useState } from "react";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, makeId } from "../utils/formatters.js";

const BLANK = { title: "", priority: "medium", due: "", category: "" };

export default function Tasks({ tasks, setTasks }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");

  const open = (task) => {
    setError("");
    setForm(task ? { ...task } : { ...BLANK });
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }
    const clean = { ...form, title: form.title.trim(), category: form.category.trim() };
    if (form.id) setTasks(tasks.map((t) => (t.id === form.id ? clean : t)));
    else setTasks([{ ...clean, id: makeId(), done: false }, ...tasks]);
    setForm(null);
  };

  const remove = (t) => {
    if (window.confirm("Delete the task: " + t.title + "?")) setTasks(tasks.filter((x) => x.id !== t.id));
  };

  const toggle = (t) => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));

  const shown = tasks.filter((t) => {
    if (status === "pending" && t.done) return false;
    if (status === "done" && !t.done) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    const s = search.trim().toLowerCase();
    if (s && !(t.title + " " + t.category).toLowerCase().includes(s)) return false;
    return true;
  });
  const pendingCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>Tasks</h1>
          <div className="muted">{pendingCount} pending, {tasks.length - pendingCount} completed. Saved in this browser only.</div>
        </div>
        <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> New task</button>
      </div>

      <div className="row wrap">
        <input className="input" style={{ flex: 1, minWidth: 160 }} aria-label="Search tasks" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" style={{ width: "auto" }} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="done">Completed</option>
        </select>
        <select className="input" style={{ width: "auto" }} aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <EmptyState icon={ListChecks} title={tasks.length ? "No matching tasks" : "No tasks yet"} text={tasks.length ? "Try changing the filters." : "Add a task to start planning your day."} actionLabel={tasks.length ? "" : "Add a task"} onAction={() => open(null)} />
        </div>
      ) : (
        <div className="col">
          {shown.map((t) => (
            <div className={"item" + (t.done ? " done" : "")} key={t.id}>
              <input type="checkbox" aria-label={"Mark " + t.title + " complete"} checked={t.done} onChange={() => toggle(t)} />
              <div className="grow">
                <div className="title">{t.title}</div>
                <div className="muted">{t.category} {t.due ? " Due " + formatDate(t.due) : ""}</div>
              </div>
              <span className={"tag " + t.priority}>{t.priority}</span>
              <button className="icon-btn" aria-label="Edit task" onClick={() => open(t)}><Pencil size={16} /></button>
              <button className="icon-btn" aria-label="Delete task" onClick={() => remove(t)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {form && (
        <Modal title={form.id ? "Edit task" : "New task"} onClose={() => setForm(null)}>
          <form className="col" onSubmit={save}>
            <label className="field">Title
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="field">Priority
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="field">Due date
              <input type="date" className="input" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
            </label>
            <label className="field">Category
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
            {error && <div className="err" role="alert">{error}</div>}
            <button className="btn btn-primary" type="submit">Save task</button>
          </form>
        </Modal>
      )}
    </div>
  );
}