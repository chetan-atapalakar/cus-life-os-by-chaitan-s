import { useState } from "react";
import { Send, Trash2, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { makeId } from "../utils/formatters.js";

const EXAMPLES = ["How many tasks are pending?", "What should I focus on today?", "Tell me about this assistant"];

export default function AIChat({ chat, setChat, tasks }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const answer = (input) => {
    const t = input.toLowerCase();
    const pending = tasks.filter((x) => !x.done);
    if (t.includes("task") || t.includes("focus") || t.includes("today")) {
      if (pending.length === 0) return "Demo reply: you have no pending tasks.";
      const top = pending.filter((x) => x.priority === "high")[0] || pending[0];
      return "Demo reply: you have " + pending.length + " pending task(s). A good one to start with is: " + top.title + ".";
    }
    return "Demo reply: this is a prototype. No AI model is connected, so I can only answer simple questions about your tasks.";
  };

  const send = (e, preset) => {
    if (e) e.preventDefault();
    const input = (preset || text).trim();
    if (!input || busy) return;
    setChat((c) => [...c, { id: makeId(), role: "user", text: input }]);
    setText("");
    setBusy(true);
    setTimeout(() => {
      setChat((c) => [...c, { id: makeId(), role: "bot", text: answer(input) }]);
      setBusy(false);
    }, 700);
  };

  const clear = () => {
    if (window.confirm("Clear the whole conversation?")) setChat([]);
  };

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>AI Assistant</h1>
          <div className="muted">Prototype</div>
        </div>
        <button className="btn btn-danger" onClick={clear}><Trash2 size={16} /> Clear</button>
      </div>
      <div className="notice">Prototype only: no real AI model is connected. Replies are simple demo responses.</div>

      <div className="card col">
        <div className="chat" aria-live="polite">
          {chat.length === 0 && (
            <EmptyState icon={Sparkles} title="Start a conversation" text="Try one of the example prompts below." />
          )}
          {chat.map((m) => (
            <div key={m.id} className={"bubble " + m.role}>{m.text}</div>
          ))}
          {busy && <div className="bubble bot muted">Thinking...</div>}
        </div>
        <div className="row wrap">
          {EXAMPLES.map((x) => (
            <button key={x} className="tag" onClick={() => send(null, x)}>{x}</button>
          ))}
        </div>
        <form className="row" onSubmit={send}>
          <input className="input" aria-label="Message" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-primary" type="submit" aria-label="Send" disabled={busy}><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
}