const express = require("express");
const router = express.Router();
const db = require("../database");

router.post("/project", (req, res) => {
  const { project, services } = req.body;

  db.serialize(() => {
    // 1️⃣ Insert project
    const projectStmt = db.prepare(`
      INSERT INTO projects (project_name, date, acres)
      VALUES (?, ?, ?)
    `);

    projectStmt.run(
      project.projectName,
      project.date,
      project.acres,
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to save project" });
        }

        const projectId = this.lastID;

        // 2️⃣ Insert services
        const serviceStmt = db.prepare(`
          INSERT INTO services (project_id, service_type, data)
          VALUES (?, ?, ?)
        `);

        services.forEach((service) => {
          serviceStmt.run(
            projectId,
            service.type,
            JSON.stringify(service.data)
          );
        });

        serviceStmt.finalize();

        return res.json({
          success: true,
          projectId,
        });
      }
    );

    projectStmt.finalize();
  });
});

module.exports = router;
