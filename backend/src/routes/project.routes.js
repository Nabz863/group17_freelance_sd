const express = require("express");
const router = express.Router();
const supabase = require("../config/db");

// GET all projects with milestones
router.get("/", async (req, res) => {
  try {
    const { data: projects, error: projErr } = await supabase
      .from("projects")
      .select("id, client_id, completed, created_at, description");

    if (projErr) throw projErr;

    if (!projects.length) return res.json([]);

    const projectIds = projects.map((p) => p.id);
    const { data: milestones, error: msErr } = await supabase
      .from("milestones")
      .select("id, project_id, title, due_date, amount")
      .in("project_id", projectIds);

    if (msErr) throw msErr;

    const projectsWithMilestones = projects.map((project) => ({
      ...project,
      milestones: milestones.filter((m) => m.project_id === project.id),
    }));

    res.json(projectsWithMilestones);
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET project titles with milestones
router.get("/projects/titles", async (req, res) => {
  try {
    const { data: projects, error: projErr } = await supabase
      .from("projects")
      .select("id, client_id, completed, created_at, description");

    if (projErr) throw projErr;

    if (!projects.length) return res.json([]);

    const projectIds = projects.map((p) => p.id);
    const { data: milestones, error: msErr } = await supabase
      .from("milestones")
      .select("id, project_id, title, due_date, amount")
      .in("project_id", projectIds);

    if (msErr) throw msErr;

    const projectsWithMilestones = projects.map((project) => {
      const desc = JSON.parse(project.description || "{}");
      return {
        id: project.id,
        clientId: project.client_id,
        title: desc.title || "(No Title)",
        completed: project.completed,
        createdAt: project.created_at,
        milestones: milestones.filter((m) => m.project_id === project.id),
      };
    });

    res.json(projectsWithMilestones);
  } catch (err) {
    console.error("Error fetching project titles:", err.message);
    res.status(500).json({ error: "Failed to fetch project titles" });
  }
});

// POST /api/projects
router.post("/", async (req, res) => {
  const {
    clientId,
    title,
    description,
    requirements,
    budget,
    deadline,
    milestones,
  } = req.body;

  try {
    const { data: project, error: projectErr } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        description: JSON.stringify({
          title,
          details: description,
          requirements,
          budget,
          deadline,
        }),
        completed: false,
      })
      .select("id")
      .single();

    if (projectErr) throw projectErr;

    const milestoneRows = milestones.map((m) => ({
      project_id: project.id,
      title: m.title,
      description: m.description,
      due_date: m.dueDate,
      amount: parseFloat(m.amount),
    }));

    const { error: msErr } = await supabase
      .from("milestones")
      .insert(milestoneRows);
    if (msErr) throw msErr;

    return res
      .status(201)
      .json({ message: "Project created", projectId: project.id });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to create project" });
  }
});

module.exports = router;
