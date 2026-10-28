import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../components/Modal.jsx";
import { formatDate, formatTime, makeId, todayISO } from "../utils/formatters.js";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Calendar({ events, setEvents }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayISO());
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const today = todayISO();

  const shift = (n) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const first = new Date(cursor.y, cursor.m, 1).getDay();
  const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(cursor.y + "-" + pad(cursor.m + 1) + "-" + pad(d));
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const sortEvents = (list) => [...list].sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  const dayEvents = sortEvents(events.filter((e) => e.date === selected));
  const upcoming = sortEvents(events.filter((e) => e.date >= today)).slice(0, 6);

  const open = (ev) => {
    setError("");
    setForm(ev ? { ...ev } : { title: "", date: selected, time: "", desc: "" });
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please enter an event title.");
      return;
    }
    if (!form.date) {
      setError("Please choose a date.");
      return;
    }
    const clean = { ...form, title: form.title.trim() };
    if (form.id) setEvents(events.map((x) => (x.id === form.id ? clean : x)));
    else setEvents([...events, { ...clean, id: makeId() }]);
    setForm(null);
  };

  const remove = (ev) => {
    if (window.confirm("Delete the event: " + ev.title + "?")) setEvents(events.filter((x) => x.id !== ev.id));
  };

  const renderEvent = (ev) => (
    <div className="item" key={ev.id}>
      <div className="grow">
        <div className="title">{ev.title}</div>
        <div className="muted">{formatDate(ev.date)} {formatTime(ev.time)} {ev.desc}</div>
      </div>
      <button className="icon-btn" aria-label="Edit event" onClick={() => open(ev)}><Pencil size={16} /></button>
      <button className="icon-btn" aria-label="Delete event" onClick={() => remove(ev)}><Trash2 size={16} /></button>
    </div>
  );

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>Calendar</h1>
          <div className="muted">An internal calendar saved in this browser. It is not connected to Google Calendar.</div>
        </div>
        <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> New event</button>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <button className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft size={18} /></button>
            <h3 style={{ margin: 0 }}>{monthLabel}</h3>
            <button className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><ChevronRight size={18} /></button>
          </div>
          <div className="cal">
            {DOW.map((d, i) => (
              <div className="dow" key={i}>{d}</div>
            ))}
            {cells.map((iso, i) =>
              iso ? (
                <button key={iso} className={"cell" + (iso === today ? " today" : "") + (iso === selected ? " sel" : "")} aria-label={formatDate(iso)} onClick={() => setSelected(iso)}>
                  {Number(iso.slice(8))}
                  {events.some((e) => e.date === iso) && <span className="dot" />}
                </button>
              ) : (
                <div key={"b" + i} className="cell blank" />
              )
            )}
          </div>
        </div>
        <div className="col">
          <div className="card">
            <h3>{formatDate(selected)}</h3>
            {dayEvents.length === 0 && <div className="muted">No events on this day.</div>}
            <div className="col">{dayEvents.map(renderEvent)}</div>
          </div>
          <div className="card">
            <h3>Upcoming</h3>
            {upcoming.length === 0 && <div className="muted">No upcoming events.</div>}
            <div className="col">{upcoming.map(renderEvent)}</div>
          </div>
        </div>
      </div>

      {form && (
        <Modal title={form.id ? "Edit event" : "New event"} onClose={() => setForm(null)}>
          <form className="col" onSubmit={save}>
            <label className="field">Title
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="field">Date
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="field">Time (optional)
              <input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </label>
            <label className="field">Description
              <textarea className="input" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            </label>
            {error && <div className="err" role="alert">{error}</div>}
            <button className="btn btn-primary" type="submit">Save event</button>
          </form>
        </Modal>
      )}
    </div>
  );
}