import { Download, Trash2 } from "lucide-react";

const ACCENTS = [
  ["#7c6cf0", "Violet"],
  ["#4f8ef7", "Blue"],
  ["#14b8a6", "Teal"],
  ["#e879a8", "Rose"],
];

export default function Settings({ prefs, setPrefs, data }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cus-life-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!window.confirm("This permanently deletes all CüS Life data stored in this browser. Continue?")) return;
    Object.keys(window.localStorage)
      .filter((k) => k.indexOf("cus.") === 0)
      .forEach((k) => window.localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      <div className="card col">
        <h3>Preferences</h3>
        <label className="field">Display name
          <input className="input" value={prefs.name} onChange={(e) => setPrefs({ ...prefs, name: e.target.value })} />
        </label>
        <div className="field">Accent colour
          <div className="row wrap">
            {ACCENTS.map((a) => (
              <button key={a[0]} className="btn" aria-pressed={prefs.accent === a[0]} style={{ borderColor: prefs.accent === a[0] ? a[0] : undefined }} onClick={() => setPrefs({ ...prefs, accent: a[0] })}>
                <span className="dot" style={{ background: a[0] }} /> {a[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card col">
        <h3>Your data</h3>
        <p className="muted">Everything is saved in this browser using localStorage. It is not encrypted, not synced to the cloud, and not shared between devices. Clearing browser data will delete it, so export a backup regularly.</p>
        <div className="row wrap">
          <button className="btn" onClick={exportData}><Download size={16} /> Export backup (JSON)</button>
          <button className="btn btn-danger" onClick={clearAll}><Trash2 size={16} /> Clear all data</button>
        </div>
      </div>

      <div className="card col">
        <h3>About</h3>
        <p className="muted">CüS Life version 1.0.0. A personal browser-based prototype for one person. There is no sign-in and no multi-user support. The AI assistant is a demo with no real model. Google Calendar and bank connections are not implemented.</p>
        <p className="muted">Repository: chetan-atapalakar/cuspersonalisedsoftwaredairy</p>
      </div>
    </div>
  );
}