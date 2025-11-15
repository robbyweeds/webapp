// server/server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.set("trust proxy", true);

// Enable CORS for local development
app.use(cors({
  origin: "*", // allow any origin for now
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Create/connect SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// Create tables if they don't exist
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT,
    date TEXT,
    acres REAL
  )
`);
db.run(`
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
  db.all("SELECT * FROM projects ORDER BY id DESC LIMIT ?", [limit], (err, rows) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, projects: rows });
  });
});

// Get a single project with services
app.get("/project/:id", (req, res) => {
  const projectId = req.params.id;

  db.get("SELECT * FROM projects WHERE id = ?", [projectId], (err, project) => {
    if (err) return res.json({ success: false, error: err.message });
    if (!project) return res.json({ success: false, error: "Project not found" });

    db.all(
      "SELECT type, data FROM services WHERE project_id = ?",
      [projectId],
      (err, services) => {
        if (err) return res.json({ success: false, error: err.message });

        const parsedServices = {};
        services.forEach(s => {
          parsedServices[s.type] = JSON.parse(s.data);
        });

        res.json({ success: true, project, services: parsedServices });
      }
    );
  });
});

// Delete a project and its services
app.delete("/project/:id", (req, res) => {
  const projectId = req.params.id;

  db.run("DELETE FROM services WHERE project_id = ?", [projectId], function(err) {
    if (err) return res.json({ success: false, error: err.message });

    db.run("DELETE FROM projects WHERE id = ?", [projectId], function(err) {
      if (err) return res.json({ success: false, error: err.message });

      res.json({ success: true });
    });
  });
});

// Save project + services
app.post("/project", (req, res) => {
  const { project, services } = req.body;
  const { projectName, date, acres } = project;

  db.run(
    `INSERT INTO projects (project_name, date, acres) VALUES (?, ?, ?)`,
    [projectName, date, acres],
    function (err) {
      if (err) return res.json({ success: false, error: err.message });

      const projectId = this.lastID;

      const stmt = db.prepare(
        `INSERT INTO services (project_id, type, data) VALUES (?, ?, ?)`
      );

      Object.entries(services).forEach(([type, data]) => {
        stmt.run(projectId, type, JSON.stringify(data));
      });

      stmt.finalize();
      res.json({ success: true, projectId });
    }
  );
});

app.listen(5000, () => console.log("Server running on port 5000"));
