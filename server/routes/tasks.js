const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo } = req.body;
    const createdBy = req.user.id;
    const assignee = assignedTo || createdBy;
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo: assignee,
      createdBy,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { assignedTo: userId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search)
      filter.title = { $regex: req.query.search, $options: "i" };

    const [total, tasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.find(filter)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email"
    );
    if (!task) return res.status(404).json({ message: "Not found" });
    if (
      task.assignedTo._id.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { title, description, dueDate, priority, status, assignedTo } =
      req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await task.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/bulk-priority", async (req, res) => {
  try {
    const updates = req.body.updates || [];
    const ops = updates.map((u) => ({
      updateOne: { filter: { _id: u.id }, update: { priority: u.priority } },
    }));
    if (ops.length > 0) await Task.bulkWrite(ops);
    res.json({ message: "OK" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
