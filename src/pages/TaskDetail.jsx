import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
      } catch {
        alert("Cannot fetch task");
        navigate("/");
      }
    })();
  }, [id, navigate]);

  if (!task) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
      <p className="mb-2">{task.description || "No description"}</p>
      <p className="mb-2">
        Due Date:{" "}
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
      </p>
      <p className="mb-4">
        Status:{" "}
        <span
          className={`font-semibold ${
            task.status === "completed" ? "text-green-600" : "text-gray-700"
          }`}
        >
          {task.status}
        </span>
      </p>
      <p className="mb-4">
        Priority:{" "}
        <span
          className={`px-2 py-1 rounded-full text-white ${
            task.priority === "high"
              ? "bg-red-500"
              : task.priority === "medium"
              ? "bg-yellow-400"
              : "bg-blue-400"
          }`}
        >
          {task.priority}
        </span>
      </p>
      <div className="flex gap-2">
        <Link
          to={`/tasks/${task._id}/edit`}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Edit
        </Link>
        <button
          onClick={async () => {
            if (window.confirm("Delete task?")) {
              await api.delete(`/tasks/${task._id}`);
              navigate("/");
            }
          }}
          className="px-3 py-1 bg-red-200 rounded hover:bg-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
