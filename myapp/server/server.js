// server/server.js
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.set("trust proxy", true);

// Enable CORS for local development
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// Create/connect SQLite database
let db;
try {
  db = new Database("./database.db");
  console.log("Connected to SQLite database.");
} catch (err) {
  console.error("Failed to connect to SQLite:", err.message);
}

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT,
    date TEXT,
    acres REAL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    type TEXT,
    data TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  )
`);

// Get last N projects
app.get("/projects", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const rows = db
      .prepare("SELECT * FROM projects ORDER BY id DESC LIMIT ?")
      .all(limit);
    res.json({ success: true, projects: rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Get a single project with services
app.get("/project/:id", (req, res) => {
  const projectId = req.params.id;

  try {
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(projectId);

    if (!project) {
      return res.json({ success: false, error: "Project not found" });
    }

    const services = db
      .prepare("SELECT type, data FROM services WHERE project_id = ?")
      .all(projectId);

    const parsedServices = {};
    services.forEach((s) => {
      parsedServices[s.type] = JSON.parse(s.data);
    });

    res.json({ success: true, project, services: parsedServices });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete a project and its services
app.delete("/project/:id", (req, res) => {
  const projectId = req.params.id;

  try {
    const deleteServices = db
      .prepare("DELETE FROM services WHERE project_id = ?")
      .run(projectId);

    const deleteProject = db
      .prepare("DELETE FROM projects WHERE id = ?")
      .run(projectId);

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Save project + services
app.post("/project", (req, res) => {
  const { project, services } = req.body;
  const { projectName, date, acres } = project;

  try {
    // Insert project
    const info = db
      .prepare(
        "INSERT INTO projects (project_name, date, acres) VALUES (?, ?, ?)"
      )
      .run(projectName, date, acres);

    const projectId = info.lastInsertRowid;

    // Insert services
    const stmt = db.prepare(
      "INSERT INTO services (project_id, type, data) VALUES (?, ?, ?)"
    );

    for (const [type, data] of Object.entries(services)) {
      stmt.run(projectId, type, JSON.stringify(data));
    }

    res.json({ success: true, projectId });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
