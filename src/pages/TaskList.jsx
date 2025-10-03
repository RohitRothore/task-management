import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Pagination from "../components/Pagination";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTasks = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", {
        params: { page: p, limit, search, status: statusFilter },
      });
      setTasks(res.data.tasks);
      setPage(res.data.page);
      setPages(res.data.pages);
    } catch (err) {
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(page);
  }, [page, search, statusFilter]);

  const toggleStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks(page);
    } catch (err) {
      alert("Status update failed");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks(page);
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <Link
          to="/tasks/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Create Task
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Due Date</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Priority</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-t">
                  <td className="py-2 px-4">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="py-2 px-4">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4">{task.status}</td>
                  <td className="py-2 px-4">
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
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <Link
                      to={`/tasks/${task._id}/edit`}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleStatus(task)}
                      className="px-2 py-1 bg-green-200 rounded hover:bg-green-300"
                    >
                      {task.status === "completed"
                        ? "Mark Pending"
                        : "Mark Completed"}
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
