import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import {
  Bell,
  Video,
  Users,
  Clock,
  BookOpen,
  FileText,
  CheckSquare,
  Plus,
  LogOut,
  ChevronRight,
  User,
  AlertCircle,
  Calendar,
  Layers,
  X,
  MessageSquare
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Popups
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskConversion, setTaskConversion] = useState(null); // { text, meetingId }
  
  // Task Creation Form State (for conversion)
  const [assigneeId, setAssigneeId] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [taskDescription, setTaskDescription] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Meetings
      const meetingsRes = await api.get("/meetings");
      if (meetingsRes.data?.success) {
        setMeetings(meetingsRes.data.meetings);
      }

      // Fetch Notifications
      const notificationsRes = await api.get("/notifications");
      if (notificationsRes.data?.success) {
        setNotifications(notificationsRes.data.notifications);
      }

      // Fetch Users for assignment
      const usersRes = await api.get("/users");
      if (usersRes.data?.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      toast.error("Dashboard load failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check auth token
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}`);
      if (res.data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success("Notification marked as read");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update notification");
    }
  };

  const convertToTask = async (e) => {
    e.preventDefault();
    if (!taskConversion) return;

    try {
      const taskData = {
        title: taskConversion.text,
        description: taskDescription || `Action item from meeting: "${taskConversion.text}"`,
        status: taskStatus,
        priority: taskPriority,
        assignee: assigneeId || null,
        meetingId: taskConversion.meetingId,
      };

      const res = await api.post("/tasks", taskData);
      if (res.data?.success) {
        toast.success("Task created on Kanban board successfully!");
        setTaskConversion(null);
        setAssigneeId("");
        setTaskPriority("medium");
        setTaskStatus("todo");
        setTaskDescription("");
      }
    } catch (err) {
      console.error("Task creation error:", err);
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const calculateMetrics = () => {
    const totalCalls = meetings.length;
    let totalMinutes = 0;
    const uniqueParticipantsSet = new Set();

    meetings.forEach((m) => {
      // Calculate duration
      if (m.startTime && m.endTime) {
        const diffMs = new Date(m.endTime) - new Date(m.startTime);
        totalMinutes += Math.round(diffMs / 60000);
      } else {
        // Fallback dummy duration for demo if not ended
        totalMinutes += 25; 
      }

      // Collect participants
      if (m.participants) {
        m.participants.forEach((p) => uniqueParticipantsSet.add(p._id || p));
      }
      if (m.participantDetails) {
        m.participantDetails.forEach((p) => {
          if (p.user) uniqueParticipantsSet.add(p.user);
        });
      }
    });

    return {
      totalCalls,
      totalDuration: `${totalMinutes} mins`,
      uniqueParticipants: uniqueParticipantsSet.size,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f1f5f9] font-sans selection:bg-indigo-500 selection:text-white pb-16">
      <ToastContainer position="top-right" theme="dark" />

      {/* TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent">
              IntellMeet AI
            </h1>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
              Intelligence & Collaboration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* KANBAN BOARD LINK */}
          <button
            onClick={() => navigate("/project")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl text-sm font-medium transition duration-200 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Project Board
          </button>

          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl transition duration-200 relative cursor-pointer"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[#151c2c] border border-[#1e293b] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3">
                  <h3 className="font-semibold text-sm text-slate-200">Notifications</h3>
                  <span className="text-xs bg-[#1e293b] px-2 py-0.5 rounded text-indigo-400 font-medium">
                    {notifications.length} Unread
                  </span>
                </div>
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    No new alerts or task assignments.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="p-3 bg-[#1e293b]/50 border border-[#334155]/30 rounded-xl flex flex-col gap-2 hover:bg-[#1e293b] transition"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] text-slate-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => markNotificationRead(notif._id)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                          >
                            Mark Read
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="p-2.5 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/20 text-rose-400 rounded-xl transition duration-200 cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* HERO HEADER */}
        <div className="bg-gradient-to-r from-[#151c2c] to-[#111827] border border-[#1e293b] rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome to IntellMeet Space
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Launch real-time mesh video rooms, collaborate via chat, and let our deterministic NLP engine automatically generate transcripts, action items, and sync tasks to Kanban.
            </p>
          </div>
          <button
            onClick={() => navigate("/lobby")}
            className="flex items-center gap-2 px-6 py-4.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create & Join Meeting
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#151c2c]/80 border border-[#1e293b] rounded-2xl p-6 shadow-lg hover:border-indigo-500/30 transition duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Meetings</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{metrics.totalCalls}</p>
            <p className="text-[10px] text-slate-500 mt-1">Total recorded sessions in history</p>
          </div>

          <div className="bg-[#151c2c]/80 border border-[#1e293b] rounded-2xl p-6 shadow-lg hover:border-indigo-500/30 transition duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Duration</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{metrics.totalDuration}</p>
            <p className="text-[10px] text-slate-500 mt-1">Cumulated talk time of all conferences</p>
          </div>

          <div className="bg-[#151c2c]/80 border border-[#1e293b] rounded-2xl p-6 shadow-lg hover:border-indigo-500/30 transition duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Unique Collaborators</span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{metrics.uniqueParticipants}</p>
            <p className="text-[10px] text-slate-500 mt-1">Unique active participants detected</p>
          </div>
        </div>

        {/* PAST MEETINGS SECTION */}
        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Session History & AI Reports
          </h3>

          {loading ? (
            <div className="bg-[#151c2c]/50 border border-[#1e293b] rounded-2xl p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Analyzing databases and compiling AI summaries...
            </div>
          ) : meetings.length === 0 ? (
            <div className="bg-[#151c2c]/50 border border-[#1e293b] rounded-2xl p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              No past sessions recorded. Start or join a meeting to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meetings.map((meeting) => (
                <div
                  key={meeting._id}
                  onClick={() => setSelectedMeeting(meeting)}
                  className="bg-[#151c2c]/60 hover:bg-[#151c2c] border border-[#1e293b] hover:border-indigo-500/40 rounded-2xl p-5 shadow-md transition duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition">
                        {meeting.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] text-indigo-400 font-semibold uppercase tracking-wider">
                        {meeting.status}
                      </span>
                    </div>
                    {meeting.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {meeting.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(meeting.startTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {meeting.participants?.length || 0} participants
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#1e293b]/80 pt-4 flex justify-between items-center">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View AI Analytics
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    {meeting.summary && (
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        AI Synced
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL REPORT MODAL */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111827] border border-[#1e293b] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#151c2c] px-6 py-4 border-b border-[#1e293b] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">AI MEETING REPORT</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedMeeting.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-1.5 hover:bg-[#1e293b] text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* SUMMARY PANEL */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
                <h4 className="font-bold text-sm text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  AI Summary
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedMeeting.summary || "No summary was generated for this meeting. Add some chats to create an AI summary."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TRANSCRIPT PANEL */}
                <div className="bg-[#151c2c]/40 border border-[#1e293b] rounded-2xl p-5 flex flex-col">
                  <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-[#1e293b]/60">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Discussion Transcript
                  </h4>
                  <div className="text-xs text-slate-400 space-y-2 overflow-y-auto max-h-60 pr-2 leading-relaxed whitespace-pre-line">
                    {selectedMeeting.transcript || "No transcript data available."}
                  </div>
                </div>

                {/* ACTION ITEMS PANEL */}
                <div className="bg-[#151c2c]/40 border border-[#1e293b] rounded-2xl p-5 flex flex-col">
                  <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-[#1e293b]/60">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Extracted Action Items
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                    {(!selectedMeeting.actionItems || selectedMeeting.actionItems.length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No action items detected.</p>
                    ) : (
                      selectedMeeting.actionItems.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-[#151c2c] border border-[#1e293b] rounded-xl flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <p className="text-xs text-slate-200 font-medium leading-relaxed">
                              {item.text}
                            </p>
                            {item.assignee && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <User className="w-3 h-3" />
                                <span>Suggested Assignee: ID {item.assignee.slice(-6)}</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setTaskConversion({ text: item.text, meetingId: selectedMeeting._id })}
                            className="bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 text-[10px] font-bold px-2 py-1.5 rounded-lg transition duration-200 flex-shrink-0 cursor-pointer"
                          >
                            Convert to Task
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#151c2c] px-6 py-4 border-t border-[#1e293b] flex justify-end">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-5 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT TO KANBAN TASK POPUP MODAL */}
      {taskConversion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-55">
          <div className="bg-[#111827] border border-[#1e293b] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setTaskConversion(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-[#1e293b] text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h4 className="text-lg font-bold text-white mb-1">Create Kanban Task</h4>
            <p className="text-xs text-indigo-400 font-medium mb-4 line-clamp-1">
              Converting: "{taskConversion.text}"
            </p>

            <form onSubmit={convertToTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskConversion.text}
                  onChange={(e) => setTaskConversion({ ...taskConversion, text: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Description / Notes
                </label>
                <textarea
                  placeholder="Provide additional context for this task..."
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
                    Initial Column
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
                  onClick={() => setTaskConversion(null)}
                  className="flex-1 py-3 bg-[#1e293b] hover:bg-[#334155] text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg transition text-xs cursor-pointer"
                >
                  Sync to Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;