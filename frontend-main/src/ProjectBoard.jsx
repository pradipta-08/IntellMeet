import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Clock,
  Sliders,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const ProjectBoard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Creation Dialog
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [assigneeId, setAssigneeId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Tasks
      const tasksRes = await api.get("/tasks");
      if (tasksRes.data?.success) {
        setTasks(tasksRes.data.tasks);
      }

      // Fetch Users
      const usersRes = await api.get("/users");
      if (usersRes.data?.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.warning("Task title is required");
      return;
    }

    try {
      const taskData = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        assignee: assigneeId || null,
      };

      const res = await api.post("/tasks", taskData);
      if (res.data?.success) {
        toast.success("Task created successfully");
        setTasks((prev) => [res.data.task, ...prev]);
        
        // Reset form
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("medium");
        setTaskStatus("todo");
        setAssigneeId("");
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data?.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.task : t))
        );
        toast.info(`Task status updated to ${newStatus.replace("_", " ")}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data?.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.success("Task deleted successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task");
    }
  };

  // Group tasks by status
  const columns = [
    { id: "todo", title: "To Do", icon: <Layers className="w-4 h-4 text-indigo-400" /> },
    { id: "in_progress", title: "In Progress", icon: <Activity className="w-4 h-4 text-amber-400" /> },
    { id: "completed", title: "Completed", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "low":
        return "bg-slate-500/10 border-slate-500/20 text-slate-400";
      case "medium":
      default:
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f1f5f9] font-sans pb-16">
      <ToastContainer position="top-right" theme="dark" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Project Board</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage tasks and assignments synced from AI meeting notes</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </header>

      {/* KANBAN BOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading Project Workspace tasks...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#1e293b]">
                    <div className="flex items-center gap-2">
                      {col.icon}
                      <span className="font-bold text-sm text-slate-300">{col.title}</span>
                    </div>
                    <span className="text-xs font-semibold bg-[#1e293b] text-slate-400 px-2 py-0.5 rounded-md">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Stack */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1">
                    {colTasks.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-600 italic">
                        Empty column
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task._id}
                          className="bg-[#151c2c] border border-[#1e293b] hover:border-indigo-500/30 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition leading-snug">
                                {task.title}
                              </h4>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 flex flex-col gap-3 pt-3 border-t border-[#1e293b]/60">
                            {/* Priority & Assignee Info */}
                            <div className="flex justify-between items-center text-[10px]">
                              <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[9px] ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>

                              {task.assignee ? (
                                <span className="flex items-center gap-1 text-slate-400 font-semibold bg-[#1e293b] px-2 py-0.5 rounded-md">
                                  <User className="w-3 h-3 text-indigo-400" />
                                  {task.assignee.name}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Unassigned</span>
                              )}
                            </div>

                            {/* Move / Transition controls */}
                            <div className="flex items-center gap-1.5 justify-end">
                              {col.id !== "todo" && (
                                <button
                                  onClick={() => handleUpdateStatus(task._id, "todo")}
                                  className="text-[9px] font-bold text-slate-400 hover:text-white px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-md transition cursor-pointer"
                                >
                                  To Do
                                </button>
                              )}
                              {col.id !== "in_progress" && (
                                <button
                                  onClick={() => handleUpdateStatus(task._id, "in_progress")}
                                  className="text-[9px] font-bold text-amber-400 hover:text-amber-300 px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-md transition cursor-pointer"
                                >
                                  Work
                                </button>
                              )}
                              {col.id !== "completed" && (
                                <button
                                  onClick={() => handleUpdateStatus(task._id, "completed")}
                                  className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-md transition cursor-pointer"
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ADD TASK DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-[#1e293b] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#1e293b] text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-lg font-bold text-white mb-4">Create New Task</h4>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="UI polish, fix backend bug..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Description / Notes
                </label>
                <textarea
                  placeholder="Task details and expectations..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#1e293b] hover:bg-[#334155] text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg transition text-xs cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;