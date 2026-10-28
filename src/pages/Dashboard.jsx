import { ListChecks, StickyNote, CalendarDays, Wallet, HeartPulse, ShoppingBasket, Sparkles, Plus, LayoutDashboard } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { formatINR, formatDate, formatTime, todayISO } from "../utils/formatters.js";

const LINKS = [
  ["tasks", "Tasks", ListChecks],
  ["notes", "Notes", StickyNote],
  ["calendar", "Calendar", CalendarDays],
  ["finance", "Finance", Wallet],
  ["wellness", "Wellness", HeartPulse],
  ["lists", "Home & Lists", ShoppingBasket],
  ["assistant", "AI Assistant", Sparkles],
];
const MOODS = ["Not logged", "Low", "Down", "Okay", "Good", "Great"];

export default function Dashboard({ name, tasks, notes, events, tx, wellness, go }) {
  const today = todayISO();
  const month = today.slice(0, 7);
  const pending = tasks.filter((t) => !t.done);
  const pct = tasks.length ? Math.round(((tasks.length - pending.length) / tasks.length) * 100) : 0;
  const monthTx = tx.filter((t) => t.date.startsWith(month));
  const spent = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const earned = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const priorities = pending.filter((t) => t.priority === "high" || (t.due && t.due <= today)).slice(0, 5);
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")))
    .slice(0, 4);
  const recent = [...notes].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);
  const entry = wellness[today];
  const mood = entry ? entry.mood : 0;
  const habitsDone = entry ? entry.habits.length : 0;
  const empty = !tasks.length && !notes.length && !events.length && !tx.length;
  const dateText = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="col" style={{ gap: 18 }}>
      <div className="page-head">
        <div>
          <h1>Welcome back, {name || "there"}</h1>
          <div className="muted">{dateText}</div>
        </div>
        <div className="row wrap">
          <button className="btn btn-primary" onClick={() => go("tasks")}><Plus size={16} /> Task</button>
          <button className="btn" onClick={() => go("notes")}><Plus size={16} /> Note</button>
          <button className="btn" onClick={() => go("calendar")}><Plus size={16} /> Event</button>
          <button className="btn" onClick={() => go("finance")}><Plus size={16} /> Transaction</button>
        </div>
      </div>

      {empty && (
        <div className="card">
          <EmptyState icon={LayoutDashboard} title="Your dashboard is empty" text="Everything here is calculated from what you add. Start with a task or a note." actionLabel="Add your first task" onAction={() => go("tasks")} />
        </div>
      )}

      <div className="grid4">
        <div className="card stat"><div className="muted">Pending tasks</div><div className="num">{pending.length}</div></div>
        <div className="card stat"><div className="muted">Completion</div><div className="num">{pct}%</div><div className="bar"><span style={{ width: pct + "%" }} /></div></div>
        <div className="card stat"><div className="muted">Spent this month</div><div className="num">{formatINR(spent)}</div></div>
        <div className="card stat"><div className="muted">Income this month</div><div className="num">{formatINR(earned)}</div></div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Daily priorities</h3>
          {priorities.length === 0 && <div className="muted">No high-priority or due tasks.</div>}
          <div className="col">
            {priorities.map((t) => (
              <div className="item" key={t.id}>
                <div className="grow title">{t.title}</div>
                <span className={"tag " + t.priority}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Upcoming events</h3>
          {upcoming.length === 0 && <div className="muted">Nothing scheduled.</div>}
          <div className="col">
            {upcoming.map((e) => (
              <div className="item" key={e.id}>
                <div className="grow title">{e.title}</div>
                <span className="muted">{formatDate(e.date)} {formatTime(e.time)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Recent notes</h3>
          {recent.length === 0 && <div className="muted">No notes yet.</div>}
          <div className="col">
            {recent.map((n) => (
              <div className="item" key={n.id}>
                <div className="grow title">{n.title}</div>
                <span className="muted">{formatDate(n.updated)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Wellness today</h3>
          <div className="muted">Mood: {MOODS[mood]}</div>
          <div className="muted">Habits completed: {habitsDone}</div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => go("wellness")}>Open wellness</button>
        </div>
      </div>

      <div className="card">
        <h3>Workspaces</h3>
        <div className="grid3">
          {LINKS.map((l) => {
            const Icon = l[2];
            return (
              <button key={l[0]} className="link-card" onClick={() => go(l[0])}>
                <Icon size={18} /> {l[1]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}