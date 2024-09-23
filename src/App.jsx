import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

function LoginPage({ onLogin }) {
  const [token, setToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function login() {
    try {
      const [name, id, avatar] = await invoke("login", { token });
      onLogin({ name, id, avatar }); // Pass the bot info to the parent
    } catch {
      setErrorMsg("Unable to Login");
    }
  }

  return (
    <div className="container">
      <h1>Discord Bot Login</h1>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <input
          id="token-input"
          type="password"
          onChange={(e) => setToken(e.currentTarget.value)}
          placeholder="Enter a Discord bot token.."
        />
        <button type="submit">Submit</button>
      </form>

      {errorMsg && <p className="error-message">{errorMsg}</p>}
    </div>
  );
}

function Dashboard({ bot }) {
  return (
    <div className="dashboard">
      <h2>Bot Information</h2>
      <img src={`https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}`} alt={`${bot.name}'s avatar`} />
      <h3>Name: {bot.name}</h3>
      <h4>ID: {bot.id}</h4>
    </div>
  );
}

function App() {
  const [bot, setBot] = useState(null);

  const handleLogin = (botInfo) => {
    setBot(botInfo); // Set the bot info after login
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={bot ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route path="/dashboard" element={bot && <Dashboard bot={bot} />} />
      </Routes>
    </Router>
  );
}

export default App;
