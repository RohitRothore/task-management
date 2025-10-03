import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

const priorities = [
  { name: "High", key: "high", color: "bg-red-500" },
  { name: "Medium", key: "medium", color: "bg-yellow-400" },
  { name: "Low", key: "low", color: "bg-blue-400" },
];

export default function PriorityBoard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    })();
  }, []);

  const moveTask = async (taskId, newPriority) => {
    await api.put(`/tasks/${taskId}`, { priority: newPriority });
    const res = await api.get("/tasks");
    setTasks(res.data.tasks);
  };

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {priorities.map((p) => (
        <div key={p.key} className="bg-gray-100 rounded-xl p-4">
          <h2
            className={`text-white font-bold px-2 py-1 rounded ${p.color} mb-4`}
          >
            {p.name} Priority
          </h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.priority === p.key)
              .map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-3 rounded shadow flex justify-between items-center"
                >
                  <Link
                    to={`/tasks/${task._id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {task.title}
                  </Link>
                  <select
                    value={task.priority}
                    onChange={(e) => moveTask(task._id, e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
