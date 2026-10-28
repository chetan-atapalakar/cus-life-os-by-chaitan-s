import { useState } from "react";
import {
  LayoutDashboard, ListChecks, StickyNote, CalendarDays, Wallet,
  HeartPulse, ShoppingBasket, Sparkles, Settings as Cog, Menu, Search, Bell,
} from "lucide-react";
import useLocalStorage from "./hooks/useLocalStorage.js";
import { todayISO } from "./utils/formatters.js";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Notes from "./pages/Notes.jsx";
import Calendar from "./pages/Calendar.jsx";
import Finance from "./pages/Finance.jsx";
import Wellness from "./pages/Wellness.jsx";
import HomeLists from "./pages/HomeLists.jsx";
import AIChat from "./pages/AIChat.jsx";
import Settings from "./pages/Settings.jsx";

const PAGES = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["tasks", "Tasks", ListChecks],
  ["notes", "Notes", StickyNote],
  ["calendar", "Calendar", CalendarDays],
  ["finance", "Finance", Wallet],
  ["wellness", "Wellness", HeartPulse],
  ["lists", "Home & Lists", ShoppingBasket],
  ["assistant", "AI Assistant", Sparkles],
  ["settings", "Settings", Cog],
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [bell, setBell] = useState(false);
  const [tasks, setTasks] = useLocalStorage("cus.tasks", []);
  const [notes, setNotes] = useLocalStorage("cus.notes", []);
  const [events, setEvents] = useLocalStorage("cus.events", []);
  const [tx, setTx] = useLocalStorage("cus.tx", []);
  const [wellness, setWellness] = useLocalStorage("cus.wellness", {});
  const [lists, setLists] = useLocalStorage("cus.lists", []);
  const [chat, setChat] = useLocalStorage("cus.chat", []);
  const [prefs, setPrefs] = useLocalStorage("cus.prefs", { name: "Chetan", accent: "#7c6cf0" });
  const today = todayISO();

  const go = (id) => {
    setPage(id);
    setMenu(false);
    setQuery("");
    setBell(false);
  };

  const q = query.trim().toLowerCase();
  const results = q
    ? [
        ...tasks.filter((t) => t.title.toLowerCase().includes(q)).map((t) => ({ key: "t" + t.id, page: "tasks", kind: "Task", label: t.title })),
        ...notes.filter((n) => (n.title + " " + n.body).toLowerCase().includes(q)).map((n) => ({ key: "n" + n.id, page: "notes", kind: "Note", label: n.title })),
        ...events.filter((e) => e.title.toLowerCase().includes(q)).map((e) => ({ key: "e" + e.id, page: "calendar", kind: "Event", label: e.title })),
      ].slice(0, 8)
    : [];

  const due = tasks.filter((t) => !t.done && t.due && t.due <= today);
  const todayEvents = events.filter((e) => e.date === today);
  const alerts = due.length + todayEvents.length;

  const data = { tasks, notes, events, transactions: tx, wellness, lists, chat, prefs };

  let view = null;
  if (page === "dashboard") view = <Dashboard name={prefs.name} tasks={tasks} notes={notes} events={events} tx={tx} wellness={wellness} go={go} />;
  if (page === "tasks") view = <Tasks tasks={tasks} setTasks={setTasks} />;
  if (page === "notes") view = <Notes notes={notes} setNotes={setNotes} />;
  if (page === "calendar") view = <Calendar events={events} setEvents={setEvents} />;
  if (page === "finance") view = <Finance tx={tx} setTx={setTx} />;
  if (page === "wellness") view = <Wellness wellness={wellness} setWellness={setWellness} />;
  if (page === "lists") view = <HomeLists lists={lists} setLists={setLists} />;
  if (page === "assistant") view = <AIChat chat={chat} setChat={setChat} tasks={tasks} />;
  if (page === "settings") view = <Settings prefs={prefs} setPrefs={setPrefs} data={data} />;

  return (
    <div className="app" style={{ "--accent": prefs.accent }}>
      <aside className={"side" + (menu ? " open" : "")} aria-label="Main navigation">
        <div className="brand">CüS Life</div>
        <div className="tagline">Your life, intelligently organised.</div>
        {PAGES.map((p) => {
          const Icon = p[2];
          return (
            <button key={p[0]} className={"nav-btn" + (page === p[0] ? " active" : "")} onClick={() => go(p[0])}>
              <Icon size={18} /> {p[1]}
            </button>
          );
        })}
      </aside>
      <div className="main">
        <header className="top">
          <button className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setMenu(!menu)}>
            <Menu size={20} />
          </button>
          <div className="searchbox pop">
            <Search size={16} className="s-ico" />
            <input className="input" aria-label="Search tasks, notes and events" placeholder="Search tasks, notes, events" value={query} onChange={(e) => setQuery(e.target.value)} />
            {q && (
              <div className="panel">
                {results.length === 0 && <div className="muted" style={{ padding: 8 }}>No matches found.</div>}
                {results.map((r) => (
                  <button key={r.key} onClick={() => go(r.page)}>
                    <span className="tag">{r.kind}</span> {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="pop">
            <button className="icon-btn" aria-label="Notifications" onClick={() => setBell(!bell)}>
              <Bell size={20} />
              {alerts > 0 && <span className="tag high">{alerts}</span>}
            </button>
            {bell && (
              <div className="panel right">
                {alerts === 0 && <div className="muted" style={{ padding: 8 }}>You are all caught up.</div>}
                {due.map((t) => (
                  <button key={t.id} onClick={() => go("tasks")}>Due: {t.title}</button>
                ))}
                {todayEvents.map((e) => (
                  <button key={e.id} onClick={() => go("calendar")}>Today: {e.title}</button>
                ))}
              </div>
            )}
          </div>
        </header>
        <main className="content">{view}</main>
      </div>
    </div>
  );
}