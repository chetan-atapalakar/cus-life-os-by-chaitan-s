import { useState } from "react";
import { Plus, Trash2, X, ShoppingBasket } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { makeId } from "../utils/formatters.js";

export default function HomeLists({ lists, setLists }) {
  const [name, setName] = useState("");
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");

  const addList = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a list name.");
      return;
    }
    setError("");
    setLists([...lists, { id: makeId(), name: name.trim(), items: [] }]);
    setName("");
  };

  const removeList = (l) => {
    if (window.confirm("Delete the list: " + l.name + "?")) setLists(lists.filter((x) => x.id !== l.id));
  };

  const patch = (id, fn) => setLists(lists.map((l) => (l.id === id ? { ...l, items: fn(l.items) } : l)));

  const addItem = (e, l) => {
    e.preventDefault();
    const text = (drafts[l.id] || "").trim();
    if (!text) return;
    patch(l.id, (items) => [...items, { id: makeId(), text, done: false }]);
    setDrafts({ ...drafts, [l.id]: "" });
  };

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>Home &amp; Lists</h1>
          <div className="muted">Shopping lists and custom lists saved in this browser.</div>
        </div>
      </div>

      <form className="row" onSubmit={addList}>
        <input className="input" aria-label="New list name" placeholder="New list, for example Groceries" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary" type="submit"><Plus size={16} /> Create</button>
      </form>
      {error && <div className="err" role="alert">{error}</div>}

      {lists.length === 0 ? (
        <div className="card">
          <EmptyState icon={ShoppingBasket} title="No lists yet" text="Create a list above to start adding items." />
        </div>
      ) : (
        <div className="grid2">
          {lists.map((l) => (
            <div className="card col" key={l.id}>
              <div className="row between">
                <h3 style={{ margin: 0 }}>{l.name}</h3>
                <button className="icon-btn" aria-label={"Delete list " + l.name} onClick={() => removeList(l)}><Trash2 size={16} /></button>
              </div>
              {l.items.length === 0 && <div className="muted">This list is empty.</div>}
              {l.items.map((it) => (
                <div className={"item" + (it.done ? " done" : "")} key={it.id}>
                  <input type="checkbox" aria-label={"Mark " + it.text + " complete"} checked={it.done} onChange={() => patch(l.id, (items) => items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))} />
                  <span className="grow title">{it.text}</span>
                  <button className="icon-btn" aria-label={"Remove " + it.text} onClick={() => patch(l.id, (items) => items.filter((x) => x.id !== it.id))}><X size={16} /></button>
                </div>
              ))}
              <form className="row" onSubmit={(e) => addItem(e, l)}>
                <input className="input" aria-label={"Add item to " + l.name} placeholder="Add an item" value={drafts[l.id] || ""} onChange={(e) => setDrafts({ ...drafts, [l.id]: e.target.value })} />
                <button className="btn" type="submit" aria-label="Add item"><Plus size={16} /></button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}