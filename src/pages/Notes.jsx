import { useState } from "react";
import { Plus, Pencil, Trash2, StickyNote } from "lucide-react";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, makeId } from "../utils/formatters.js";

export default function Notes({ notes, setNotes }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const open = (note) => {
    setError("");
    setForm(note ? { ...note } : { title: "", body: "" });
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    const now = new Date().toISOString();
    if (form.id) {
      setNotes(notes.map((n) => (n.id === form.id ? { ...n, title: form.title.trim(), body: form.body, updated: now } : n)));
    } else {
      const id = makeId();
      setNotes([{ id, title: form.title.trim(), body: form.body, created: now, updated: now }, ...notes]);
      setSelectedId(id);
    }
    setForm(null);
  };

  const remove = (n) => {
    if (window.confirm("Delete the note: " + n.title + "?")) {
      setNotes(notes.filter((x) => x.id !== n.id));
      setSelectedId(null);
    }
  };

  const s = search.trim().toLowerCase();
  const shown = notes.filter((n) => !s || (n.title + " " + n.body).toLowerCase().includes(s));
  const selected = notes.find((n) => n.id === selectedId);

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>Notes</h1>
          <div className="muted">Stored in this browser only. Not encrypted.</div>
        </div>
        <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> New note</button>
      </div>
      <input className="input" aria-label="Search notes" placeholder="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} />

      {notes.length === 0 ? (
        <div className="card">
          <EmptyState icon={StickyNote} title="No notes yet" text="Capture ideas, plans and references here." actionLabel="Write a note" onAction={() => open(null)} />
        </div>
      ) : (
        <div className="grid2">
          <div className="col">
            {shown.length === 0 && <div className="muted">No notes match your search.</div>}
            {shown.map((n) => (
              <button key={n.id} className="item" style={{ textAlign: "left", borderColor: n.id === selectedId ? "var(--accent2)" : undefined }} onClick={() => setSelectedId(n.id)}>
                <div className="grow">
                  <div className="title">{n.title}</div>
                  <div className="muted">Updated {formatDate(n.updated)}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="card">
            {selected ? (
              <div className="col">
                <h2>{selected.title}</h2>
                <div className="muted">Created {formatDate(selected.created)}. Updated {formatDate(selected.updated)}.</div>
                <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{selected.body || "This note is empty."}</p>
                <div className="row">
                  <button className="btn" onClick={() => open(selected)}><Pencil size={16} /> Edit</button>
                  <button className="btn btn-danger" onClick={() => remove(selected)}><Trash2 size={16} /> Delete</button>
                </div>
              </div>
            ) : (
              <div className="muted">Select a note to read it.</div>
            )}
          </div>
        </div>
      )}

      {form && (
        <Modal title={form.id ? "Edit note" : "New note"} onClose={() => setForm(null)}>
          <form className="col" onSubmit={save}>
            <label className="field">Title
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="field">Content
              <textarea className="input" style={{ minHeight: 180 }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </label>
            {error && <div className="err" role="alert">{error}</div>}
            <button className="btn btn-primary" type="submit">Save note</button>
          </form>
        </Modal>
      )}
    </div>
  );
}