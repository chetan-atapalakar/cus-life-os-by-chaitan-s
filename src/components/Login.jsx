import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import Logo from "./Logo.jsx";

async function hashText(text) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("No crypto");
  }
  const data = new TextEncoder().encode("cus-life:" + text);
  const buffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Login({ auth, onCreate, onUnlock, onReset }) {
  const creating = !auth;
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);

  const fail = (message) => {
    setError(message);
    setShake((s) => s + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (creating) {
      if (!name.trim()) return fail("Please enter your name.");
      if (pass.length < 4) return fail("Use at least 4 characters for your passcode.");
      if (pass !== confirm) return fail("The passcodes do not match.");
    } else if (!pass) {
      return fail("Enter your passcode.");
    }
    setBusy(true);
    try {
      const hash = await hashText(pass);
      if (creating) onCreate(name.trim(), hash);
      else if (hash === auth.hash) onUnlock();
      else fail("Incorrect passcode.");
    } catch (err) {
      fail("This browser cannot secure a passcode. Open the site over https in Chrome.");
    }
    setBusy(false);
  };

  const reset = () => {
    if (window.confirm("This permanently deletes the passcode and ALL CüS Life data in this browser. Continue?")) {
      onReset();
    }
  };

  return (
    <motion.form
      key={shake}
      className="login-card glass"
      onSubmit={submit}
      initial={shake ? false : { opacity: 0, y: 30, scale: 0.96 }}
      animate={shake ? { opacity: 1, y: 0, scale: 1, x: [0, -10, 10, -8, 8, 0] } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Logo size={30} />
      </div>
      <h2>{creating ? "Create your workspace" : "Welcome back, " + auth.name}</h2>
      <p className="muted">{creating ? "Set a name and a passcode for this device." : "Enter your passcode to unlock."}</p>

      {creating && (
        <div className="input-ic">
          <User size={16} />
          <input className="input" aria-label="Your name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div className="input-ic">
        <Lock size={16} />
        <input className="input" type={show ? "text" : "password"} aria-label="Passcode" placeholder="Passcode" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button type="button" className="icon-btn eye" aria-label={show ? "Hide passcode" : "Show passcode"} onClick={() => setShow(!show)}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {creating && (
        <div className="input-ic">
          <Lock size={16} />
          <input className="input" type={show ? "text" : "password"} aria-label="Confirm passcode" placeholder="Confirm passcode" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      )}

      {error && <div className="err" role="alert" style={{ textAlign: "center" }}>{error}</div>}

      <motion.button className="btn btn-primary" type="submit" disabled={busy} whileTap={{ scale: 0.97 }}>
        {creating ? "Create and enter" : "Unlock"}
      </motion.button>
      <div className="notice">
        This passcode only locks the app on this device. It is not a server login and does not encrypt your data.
      </div>
      {!creating && (
        <button type="button" className="link-btn" onClick={reset}>Forgot passcode? Erase everything and start over</button>
      )}
    </motion.form>
  );
}