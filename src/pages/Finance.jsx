import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatINR, formatDate, makeId, todayISO } from "../utils/formatters.js";

const EXPENSE_CATS = ["Food", "Transport", "Rent", "Bills", "Shopping", "Health", "Entertainment", "Other"];
const INCOME_CATS = ["Salary", "Business", "Investments", "Other"];

export default function Finance({ tx, setTx }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const month = todayISO().slice(0, 7);

  const open = (t) => {
    setError("");
    setForm(t ? { ...t, amount: String(t.amount) } : { type: "expense", amount: "", category: "Food", date: todayISO(), desc: "" });
  };

  const changeType = (type) => {
    setForm({ ...form, type, category: type === "expense" ? EXPENSE_CATS[0] : INCOME_CATS[0] });
  };

  const save = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.date) {
      setError("Please choose a date.");
      return;
    }
    const clean = { ...form, amount, desc: form.desc.trim() };
    if (form.id) setTx(tx.map((t) => (t.id === form.id ? clean : t)));
    else setTx([{ ...clean, id: makeId() }, ...tx]);
    setForm(null);
  };

  const remove = (t) => {
    if (window.confirm("Delete this transaction?")) setTx(tx.filter((x) => x.id !== t.id));
  };

  const sum = (list, type) => list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const monthTx = tx.filter((t) => t.date.startsWith(month));
  const income = sum(monthTx, "income");
  const expense = sum(monthTx, "expense");
  const balance = sum(tx, "income") - sum(tx, "expense");

  const totals = {};
  monthTx.filter((t) => t.type === "expense").forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  const catList = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  const history = [...tx].sort((a, b) => b.date.localeCompare(a.date));
  const cats = form && form.type === "income" ? INCOME_CATS : EXPENSE_CATS;

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>Finance</h1>
          <div className="muted">Manually entered data in this browser. No bank connection. Never enter passwords or PINs.</div>
        </div>
        <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add transaction</button>
      </div>

      <div className="grid3">
        <div className="card stat"><div className="muted">Income this month</div><div className="num" style={{ color: "var(--ok)" }}>{formatINR(income)}</div></div>
        <div className="card stat"><div className="muted">Expenses this month</div><div className="num" style={{ color: "var(--bad)" }}>{formatINR(expense)}</div></div>
        <div className="card stat"><div className="muted">Overall balance</div><div className="num">{formatINR(balance)}</div></div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Expenses by category (this month)</h3>
          {catList.length === 0 && <div className="muted">No expenses this month.</div>}
          <div className="col">
            {catList.map((c) => (
              <div key={c}>
                <div className="row between"><span>{c}</span><span className="muted">{formatINR(totals[c])}</span></div>
                <div className="bar"><span style={{ width: Math.round((totals[c] / expense) * 100) + "%" }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Transaction history</h3>
          {history.length === 0 ? (
            <EmptyState icon={Wallet} title="No transactions" text="Add your income and expenses to see summaries." actionLabel="Add transaction" onAction={() => open(null)} />
          ) : (
            <div className="col">
              {history.map((t) => (
                <div className="item" key={t.id}>
                  <div className="grow">
                    <div className="title">{t.desc || t.category}</div>
                    <div className="muted">{t.category} {formatDate(t.date)}</div>
                  </div>
                  <strong style={{ color: t.type === "income" ? "var(--ok)" : "var(--bad)" }}>
                    {t.type === "income" ? "+" : "-"}{formatINR(t.amount)}
                  </strong>
                  <button className="icon-btn" aria-label="Edit transaction" onClick={() => open(t)}><Pencil size={16} /></button>
                  <button className="icon-btn" aria-label="Delete transaction" onClick={() => remove(t)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {form && (
        <Modal title={form.id ? "Edit transaction" : "Add transaction"} onClose={() => setForm(null)}>
          <form className="col" onSubmit={save}>
            <label className="field">Type
              <select className="input" value={form.type} onChange={(e) => changeType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="field">Amount (₹)
              <input type="number" min="0" step="0.01" inputMode="decimal" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </label>
            <label className="field">Category
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {cats.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">Date
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="field">Description
              <input className="input" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            </label>
            {error && <div className="err" role="alert">{error}</div>}
            <button className="btn btn-primary" type="submit">Save transaction</button>
          </form>
        </Modal>
      )}
    </div>
  );
}