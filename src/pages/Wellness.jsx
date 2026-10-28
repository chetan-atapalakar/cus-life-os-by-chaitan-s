import { todayISO, formatDate } from "../utils/formatters.js";

const HABITS = ["Drink water", "Exercise", "Read", "Meditate", "Sleep on time"];
const MOODS = ["Low", "Down", "Okay", "Good", "Great"];

export default function Wellness({ wellness, setWellness }) {
  const today = todayISO();
  const entry = wellness[today] || { mood: 0, journal: "", reflection: "", habits: [] };

  const update = (patch) => setWellness({ ...wellness, [today]: { ...entry, ...patch } });
  const toggle = (h) =>
    update({ habits: entry.habits.includes(h) ? entry.habits.filter((x) => x !== h) : [...entry.habits, h] });

  const past = Object.keys(wellness).filter((d) => d !== today).sort().reverse().slice(0, 5);

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <h1>Wellness</h1>
          <div className="muted">Personal reflection saved in this browser. This is not medical advice.</div>
        </div>
      </div>

      <div className="card">
        <h3>How are you today? (optional)</h3>
        <div className="row">
          {MOODS.map((m, i) => (
            <button key={m} className={"mood" + (entry.mood === i + 1 ? " on" : "")} onClick={() => update({ mood: entry.mood === i + 1 ? 0 : i + 1 })}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Habits</h3>
          <div className="col">
            {HABITS.map((h) => (
              <label className="item" key={h}>
                <input type="checkbox" checked={entry.habits.includes(h)} onChange={() => toggle(h)} />
                <span className="title">{h}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="card col">
          <h3>Journal</h3>
          <textarea className="input" aria-label="Journal entry" placeholder="Write about your day" value={entry.journal} onChange={(e) => update({ journal: e.target.value })} />
          <h3>Daily reflection</h3>
          <textarea className="input" aria-label="Daily reflection" placeholder="What went well? What will you improve?" value={entry.reflection} onChange={(e) => update({ reflection: e.target.value })} />
        </div>
      </div>

      <div className="card">
        <h3>Previous days</h3>
        {past.length === 0 && <div className="muted">No earlier entries yet.</div>}
        <div className="col">
          {past.map((d) => (
            <div className="item" key={d}>
              <div className="grow title">{formatDate(d)}</div>
              <span className="muted">Mood: {wellness[d].mood ? MOODS[wellness[d].mood - 1] : "not logged"}. Habits: {wellness[d].habits.length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}