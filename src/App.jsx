import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, ListChecks, StickyNote, CalendarDays, Wallet,
  HeartPulse, ShoppingBasket, Sparkles, Settings as Cog, Menu, Search, Bell, Lock, CheckCircle2,
} from "lucide-react";
import useLocalStorage from "./hooks/useLocalStorage.js";
import { todayISO } from "./utils/formatters.js";
import Splash from "./components/Splash.jsx";
import Login from "./components/Login.jsx";
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

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
  transition: { duration: 0.18 },
};

function readSession() {
  try {
    return window.sessionStorage.getItem("cus.unlocked") === "1";
  } catch (error) {
    return false;
  }
}

function writeSession(on) {
  try {
    if (on) window.sessionStorage.setItem("cus.unlocked", "1");
    else window.sessionStorage.removeItem("cus.unlocked");
  } catch (error) {
    // Session storage may be blocked; the app still works.
  }
}

export default function App() {
  const [phase, setPhase] = useState("splash");
  const [unlocked, setUnlocked] = useState(readSession);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState("dashboard");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [bell, setBell] = useState(false);
  const [auth, setAuth] = useLocalStorage("cus.auth", null);
  const [tasks, setTasks] = useLocalStorage("cus.tasks", []);
  const [notes, setNotes] = useLocalStorage("cus.notes", []);
  const [events, setEvents] = useLocalStorage("cus.events", []);
  const [tx, setTx] = useLocalStorage("cus.tx", []);
  const [wellness, setWellness] = useLocalStorage("cus.wellness", {});
  const [lists, setLists] = useLocalStorage("cus.lists", []);
  const [chat, setChat] = useLocalStorage("cus.chat", []);
  const [prefs, setPrefs] = useLocalStorage("cus.prefs", { name: "Chetan", accent: "#7c6cf0" });
  const today = todayISO();

  const finishSplash = useCallback(() => setPhase("ready"), []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  const unlock = () => {
    writeSession(true);
    setUnlocked(true);
    showToast("Welcome back, " + (auth ? auth.name : "") + ".");
  };

  const create = (name, hash) => {
    setAuth({ name: name, hash: hash });
    setPrefs({ ...prefs, name: name });
    writeSession(true);
    setUnlocked(true);
    showToast("Your workspace is ready.");
  };

  const lock = () => {
    writeSession(false);
    setUnlocked(false);
    setMenu(false);
    setPage("dashboard");
  };

  const resetAll = () => {
    Object.keys(window.localStorage)
      .filter((k) => k.indexOf("cus.") === 0)
      .forEach((k) => window.localStorage.removeItem(k));
    writeSession(false);
    window.location.reload();
  };

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

  const inside = unlocked && auth;
  const initial = (auth && auth.name ? auth.name : "C").charAt(0).toUpperCase();

  return (
    <div className="app-root" style={{ "--accent": prefs.accent }}>
      <div className="blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <AnimatePresence mode="wait">
        {phase === "splash" && <Splash key="splash" onDone={finishSplash} />}

        {phase === "ready" && !inside && (
          <motion.div key="login" className="login-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }}>
            <Login auth={auth} onCreate={create} onUnlock={unlock} onReset={resetAll} />
          </motion.div>
        )}

        {phase === "ready" && inside && (
          <motion.div key="shell" className="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <aside className={"side" + (menu ? " open" : "")} aria-label="Main navigation">
              <div className="brand">CüS Life</div>
              <div className="tagline">Your life, intelligently organised.</div>
              {PAGES.map((p) => {
                const Icon = p[2];
                const active = page === p[0];
                return (
                  <button key={p[0]} className={"nav-btn" + (active ? " active" : "")} onClick={() => go(p[0])}>
                    {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                    <Icon size={18} />
                    <span>{p[1]}</span>
                  </button>
                );
              })}
              <div className="side-foot">
                <div className="user-chip">
                  <div className="avatar">{initial}</div>
                  <div className="title">{auth.name}</div>
                </div>
                <button className="btn" onClick={lock}><Lock size={16} /> Lock app</button>
              </div>
            </aside>

            <AnimatePresence>
              {menu && (
                <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
              )}
            </AnimatePresence>

            <div className="main">
              <header className="top">
                <button className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setMenu(!menu)}>
                  <Menu size={20} />
                </button>
                <div className="searchbox pop">
                  <Search size={16} className="s-ico" />
                  <input className="input" aria-label="Search tasks, notes and events" placeholder="Search tasks, notes, events" value={query} onChange={(e) => setQuery(e.target.value)} />
                  <AnimatePresence>
                    {q && (
                      <motion.div className="panel" {...panelMotion}>
                        {results.length === 0 && <div className="muted" style={{ padding: 8 }}>No matches found.</div>}
                        {results.map((r) => (
                          <button key={r.key} onClick={() => go(r.page)}>
                            <span className="tag">{r.kind}</span> {r.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="pop">
                  <button className="icon-btn" aria-label="Notifications" onClick={() => setBell(!bell)}>
                    <Bell size={20} />
                    {alerts > 0 && (
                      <motion.span className="badge" initial={{ scale: 0 }} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
                        {alerts}
                      </motion.span>
                    )}
                  </button>
                  <AnimatePresence>
                    {bell && (
                      <motion.div className="panel right" {...panelMotion}>
                        {alerts === 0 && <div className="muted" style={{ padding: 8 }}>You are all caught up.</div>}
                        {due.map((t) => (
                          <button key={t.id} onClick={() => go("tasks")}>Due: {t.title}</button>
                        ))}
                        {todayEvents.map((e) => (
                          <button key={e.id} onClick={() => go("calendar")}>Today: {e.title}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </header>

              <main className="content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.28 }}
                  >
                    {view}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="toast-wrap">
        <AnimatePresence>
          {toast && (
            <motion.div className="toast" initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <CheckCircle2 size={18} />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}