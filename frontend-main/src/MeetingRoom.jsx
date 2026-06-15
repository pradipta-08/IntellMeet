import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./socket/socket";
import ChatSidebar from "./components/meeting/ChatSidebar";
import api from "./services/api";

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const MicIcon = ({ on }) =>
  on ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );

const CameraIcon = ({ on }) =>
  on ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const ScreenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.6 19.79 19.79 0 0 1 1.2 1 2 2 0 0 1 3.18 0a2 2 0 0 1 .55.07 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.45 2.11l-1.27 1.27a16 16 0 0 0 2.6 3.41" /><line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

const LockIcon = ({ locked }) =>
  locked ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.26 9.6 19.79 19.79 0 0 1 1.2 1 2 2 0 0 1 3.18 0a2 2 0 0 1 .55.07 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ─── AVATAR PLACEHOLDER (when camera is off) ─────────────────────────────────
const AvatarTile = ({ name, size = "lg" }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#3b82f6", "#14b8a6",
  ];
  const bg = colors[name?.charCodeAt(0) % colors.length] ?? "#6366f1";
  const sz = size === "lg" ? { width: 72, height: 72, fontSize: 28 } : { width: 40, height: 40, fontSize: 16 };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: sz.width, height: sz.height, borderRadius: "50%", background: bg, fontSize: sz.fontSize, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: 1 }}>
      {initials}
    </div>
  );
};

// ─── REMOTE VIDEO TILE ────────────────────────────────────────────────────────
const RemoteVideo = ({
  stream,
  name,
  isSharingScreen
}) => {

  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;

    videoRef.current.srcObject = stream;

    const videoTrack = stream.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.onmute = () => {
        console.log("REMOTE VIDEO MUTED");
      };

      videoTrack.onunmute = async () => {
        console.log("REMOTE VIDEO UNMUTED");

        try {
          videoRef.current.srcObject = null;
          videoRef.current.srcObject = stream;

          await videoRef.current.play();
        } catch (err) {
          console.log(err);
        }
      };
    }

    videoRef.current.play().catch(console.error);

  }, [stream]);

  return (
    <div style={styles.videoTile}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={styles.videoEl}
      />

      <div style={styles.videoNameTag}>
        {isSharingScreen && (
          <span style={styles.screenBadge}>
            📺 Screen
          </span>
        )}

        <span>{name}</span>
      </div>
    </div>
  );
};

// ─── PARTICIPANT ROW ──────────────────────────────────────────────────────────
const ParticipantRow = ({ participant, isHost, currentUserId, meetingId, currentUser }) => {
  const isSelf = participant.userId === currentUserId;
  return (
    <div style={styles.participantRow}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AvatarTile name={participant.name} size="sm" />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>
            {participant.name}
            {isSelf && <span style={styles.youBadge}>You</span>}
            {participant.isHost && <span style={styles.hostBadge}>Host</span>}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: participant.micOn ? "#34d399" : "#f87171" }}>
              {participant.micOn ? "🎤 On" : "🔇 Off"}
            </span>
            <span style={{ fontSize: 11, color: participant.videoOn ? "#34d399" : "#f87171" }}>
              {participant.videoOn ? "📷 On" : "📷 Off"}
            </span>
          </div>
        </div>
      </div>

      {isHost && !isSelf && (
        <div style={{ display: "flex", gap: 6 }}>
          <button style={{ ...styles.hostBtn, background: "#3b82f620", color: "#93c5fd" }}
            onClick={() => socket.emit("transfer-host", { meetingId, hostId: currentUser._id, targetUserId: participant.userId })}>
            Host
          </button>
          <button style={{ ...styles.hostBtn, background: "#f9731620", color: "#fdba74" }}
            onClick={() => socket.emit("mute-user", { meetingId, hostId: currentUser._id, targetUserId: participant.userId })}>
            Mute
          </button>
          <button style={{ ...styles.hostBtn, background: "#ef444420", color: "#fca5a5" }}
            onClick={() => socket.emit("remove-user", { meetingId, hostId: currentUser._id, targetUserId: participant.userId })}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

// ─── CONTROL BUTTON ───────────────────────────────────────────────────────────
const CtrlBtn = ({ onClick, active, danger, label, children, badge }) => (
  <button onClick={onClick} title={label} style={{
    ...styles.ctrlBtn,
    background: danger ? "#ef4444" : active ? "#ffffff18" : "#ffffff10",
    border: `1px solid ${danger ? "#ef444440" : active ? "#ffffff30" : "#ffffff15"}`,
    color: danger ? "#fff" : active ? "#fff" : "#94a3b8",
    position: "relative",
  }}>
    {children}
    <span style={{ fontSize: 11, marginTop: 4, display: "block", whiteSpace: "nowrap" }}>{label}</span>
    {badge > 0 && (
      <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {badge}
      </span>
    )}
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const MeetingRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnections = useRef({});
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [meetingLocked, setMeetingLocked] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteSharingScreen, setRemoteSharingScreen] = useState(false);
  const [screenSharerName, setScreenSharerName] = useState("");
  const screenStreamRef = useRef(null);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const showChatRef = useRef(showChat);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const resolveUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/users/profile");
          if (res.data?.success) {
            setCurrentUser(res.data.user);
            return;
          }
        } catch (e) {
          console.error("Failed to fetch user profile, using guest fallback", e);
        }
      }
      
      // Guest fallback
      let userId = localStorage.getItem("meetingUserId");
      let userName = localStorage.getItem("meetingUserName");
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem("meetingUserId", userId);
      }
      if (!userName) {
        userName = prompt("Enter your name") || "Guest";
        localStorage.setItem("meetingUserName", userName);
      }
      setCurrentUser({ _id: userId, name: userName });
    };

    resolveUser();
  }, []);

  const createPeerConnection = (targetSocketId, isOfferer = false) => {
    if (peerConnections.current[targetSocketId]) return peerConnections.current[targetSocketId];
    const pc = new RTCPeerConnection(servers);
    peerConnections.current[targetSocketId] = pc;

    if (isOfferer) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { targetSocketId, offer });
        } catch (e) { console.error(e); }
      };
    }

    const currentVideoTrack = screenSharing ? screenStreamRef.current?.getVideoTracks()[0] : localStream?.getVideoTracks()[0];
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack && localStream) pc.addTrack(audioTrack, localStream);
    if (currentVideoTrack) pc.addTrack(currentVideoTrack, screenSharing ? screenStreamRef.current : localStream);
    pc.ontrack = (event) => {

      console.log(
        "TRACK RECEIVED:",
        targetSocketId,
        event.track.kind,
        event.track.readyState
      );

      setRemoteStreams((prev) => ({
        ...prev,
        [targetSocketId]:
          event.streams[0],
      }));

      event.track.onunmute = () => {
        console.log(
          "TRACK UNMUTED:",
          targetSocketId
        );
      };

      event.track.onmute = () => {
        console.log(
          "TRACK MUTED:",
          targetSocketId
        );
      };
    };
    pc.onicecandidate = (event) => { if (event.candidate) socket.emit("ice-candidate", { targetSocketId, candidate: event.candidate }); };

    return pc;
  };

  useEffect(() => {
    if (!currentUser) return;

    const initMeeting = async () => {
      await startLocalStream();
      socket.on("connect", () => { socket.emit("join-meeting", { meetingId: id, userId: currentUser._id, name: currentUser.name }); });
      socket.on("disconnect", (reason) => { if (reason !== "io client disconnect") toast.warning("Connection lost. Reconnecting…"); });
      socket.connect();
    };
    initMeeting();
    return () => { socket.off("connect"); socket.off("disconnect"); socket.disconnect(); if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach((t) => t.stop()); };
  }, [currentUser]);

  useEffect(() => {
    socket.on(
      "PARTICIPANTS_UPDATED",
      (data) => {

        setParticipants(data);

        const activeSocketIds =
          data.map(
            (p) => p.socketId
          );

        // REMOVE DEAD PEERS

        Object.keys(
          peerConnections.current
        ).forEach(
          (socketId) => {

            if (
              !activeSocketIds.includes(
                socketId
              )
            ) {

              peerConnections.current[
                socketId
              ]?.close();

              delete peerConnections.current[
                socketId
              ];

              setRemoteStreams(
                (prev) => {

                  const updated = {
                    ...prev,
                  };

                  delete updated[
                    socketId
                  ];

                  return updated;
                }
              );
            }
          }
        );

        // CREATE NEW PEERS

        data.forEach(
          (participant) => {

            if (
              participant.socketId !== socket.id &&
              !peerConnections.current[participant.socketId]
            ) {
              console.log(
                "Creating Peer:",
                participant.socketId,
                "Offerer:",
                socket.id < participant.socketId
              );

              createPeerConnection(
                participant.socketId,
                socket.id < participant.socketId
              );
            }
          }); // Closes your data array loop (forEach/map)

        const me = data.find((p) => p.userId === currentUser._id);
        setIsHost(me?.isHost || false);
      }); // Closes socket.on("PARTICIPANTS_UPDATED")

    return () => {
      socket.off("PARTICIPANTS_UPDATED");
    };
  }, [localStream, screenSharing]);
  useEffect(() => {
    socket.on("notification", (data) => {
      const types = { USER_JOINED: toast.success, HOST_TRANSFERRED: toast.success, SCREEN_SHARE_STARTED: toast.success, USER_LEFT: toast.info, USER_DISCONNECTED: toast.info, USER_MUTED: toast.info, USER_REMOVED: toast.info, MEETING_LOCKED: toast.error, MEETING_UNLOCKED: toast.success };
      (types[data.type] || toast.info)(data.message);
      if (["USER_LEFT", "USER_REMOVED", "USER_DISCONNECTED"].includes(data.type) && data.socketId) {
        if (peerConnections.current[data.socketId]) { peerConnections.current[data.socketId].close(); delete peerConnections.current[data.socketId]; }
        setRemoteStreams((prev) => { const u = { ...prev }; delete u[data.socketId]; return u; });
      }
    });
    return () => socket.off("notification");
  }, []);

  useEffect(() => { socket.on("meeting-lock-status", (d) => setMeetingLocked(d.locked)); return () => socket.off("meeting-lock-status"); }, []);
  useEffect(() => { socket.on("screen-share-started", (d) => { setRemoteSharingScreen(true); setScreenSharerName(d.name); }); socket.on("screen-share-stopped", () => { setRemoteSharingScreen(false); setScreenSharerName(""); }); return () => { socket.off("screen-share-started"); socket.off("screen-share-stopped"); }; }, []);
  useEffect(() => { socket.on("error-message", (d) => { toast.error(d.message); navigate("/dashboard"); }); return () => socket.off("error-message"); }, []);
  useEffect(() => { socket.on("force-mute", () => { if (!localStream) return; localStream.getAudioTracks().forEach((t) => { t.enabled = false; }); setMicOn(false); toast.warning("Host muted your microphone"); }); return () => socket.off("force-mute"); }, [localStream]);
  useEffect(() => { socket.on("removed-from-meeting", (d) => { toast.error(d.message); leaveCall(); }); return () => socket.off("removed-from-meeting"); }, [localStream]);

  useEffect(() => {
    if (videoOn && localVideoRef.current && localStream) {
      localVideoRef.current.play().catch((err) => console.log("Local video play error:", err));
    }
  }, [videoOn, localStream]);

  useEffect(() => {
    socket.on("offer", async (data) => {
      try { const pc = createPeerConnection(data.senderSocketId, false); await pc.setRemoteDescription(new RTCSessionDescription(data.offer)); const answer = await pc.createAnswer(); await pc.setLocalDescription(answer); socket.emit("answer", { targetSocketId: data.senderSocketId, answer }); } catch (e) { console.log(e); }
    });
    return () => socket.off("offer");
  }, [localStream, id, screenSharing]);

  useEffect(() => { socket.on("answer", async (data) => { try { const pc = peerConnections.current[data.senderSocketId]; if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer)); } catch (e) { console.log(e); } }); return () => socket.off("answer"); }, []);
  useEffect(() => { socket.on("ice-candidate", async (data) => { try { const pc = peerConnections.current[data.senderSocketId]; if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) { console.log(e); } }); return () => socket.off("ice-candidate"); }, []);

  useEffect(() => {
    socket.on("receive-message", (chat) => {
      const normalized = { ...chat, sender: chat.sender ?? { name: chat.senderName || "Guest" } };
      setMessages((prev) => [...prev, normalized]);
      if (!showChatRef.current) setUnreadCount((p) => p + 1);
    });
    return () => socket.off("receive-message");
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/chat/${id}`);
        if (res.data?.success) setMessages(res.data.chats.map((c) => ({ ...c, sender: c.sender ?? { name: c.senderName || "Guest" } })));
      } catch (e) { console.error(e); }
    };
    fetchChatHistory();
  }, [id]);

  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    socket.emit("send-message", { meetingId: id, senderId: currentUser._id, senderName: currentUser.name, message: text });
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (e) { console.log("Camera/Mic Error:", e); toast.error("Could not access camera or microphone"); }
  };

  const startCall = async () => {
    if (!localStream) { toast.warning("Camera/Microphone not ready yet."); return; }
    participants.forEach((p) => { if (p.socketId !== socket.id) createPeerConnection(p.socketId, true); });
  };

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    localStream?.getAudioTracks().forEach((t) => { t.enabled = next; });
    socket.emit("toggle-mic", { meetingId: id, userId: currentUser._id, micOn: next });
  };

  const toggleVideo = async () => {
    const next = !videoOn;

    setVideoOn(next);

    const videoTrack =
      localStream?.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = next;

    // IMPORTANT FIX
    Object.values(peerConnections.current).forEach(
      async (pc) => {
        const sender = pc
          .getSenders()
          .find(
            (s) =>
              s.track &&
              s.track.kind === "video"
          );

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
    );

    socket.emit("toggle-video", {
      meetingId: id,
      userId: currentUser._id,
      videoOn: next,
    });
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      const screenTrack = stream.getVideoTracks()[0];
      for (let pid in peerConnections.current) {
        const sender = peerConnections.current[pid].getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      screenTrack.onended = stopScreenShare;
      setScreenSharing(true);
      socket.emit("start-screen-share", { meetingId: id, userId: currentUser._id });
      toast.success("Screen sharing started");
    } catch (e) { toast.error("Failed to share screen"); }
  };

  const stopScreenShare = async () => {
    try {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const cameraTrack = localStream?.getVideoTracks()[0];
      for (let pid in peerConnections.current) {
        const sender = peerConnections.current[pid].getSenders().find((s) => s.track?.kind === "video");
        if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      setScreenSharing(false);
      socket.emit("stop-screen-share", { meetingId: id, userId: currentUser._id });
      toast.info("Screen sharing stopped");
    } catch (e) { console.log(e); }
  };

  const leaveCall = () => {
    try {
      localStream?.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    try {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    screenStreamRef.current = null;
    Object.keys(peerConnections.current).forEach((k) => {
      try {
        peerConnections.current[k].close();
      } catch (e) {}
    });
    peerConnections.current = {};
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    try {
      socket.emit("leave-meeting", { meetingId: id, userId: currentUser._id });
      socket.disconnect();
    } catch (e) {}
    
    // Redirect based on authentication
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const remoteEntries = Object.keys(remoteStreams);
  const totalTiles = 1 + remoteEntries.length;
  const gridCols = totalTiles === 1 ? 1 : totalTiles <= 4 ? 2 : 3;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm">Securing meeting credentials...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" theme="dark" toastStyle={{ background: "#1e293b", border: "1px solid #334155" }} />

      <div style={styles.root}>
        {/* ── HEADER ── */}
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.logo}>
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2" /><path d="M8 12l3 3 5-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Meeting ID</div>
              <div style={{ fontSize: 15, color: "#f1f5f9", fontWeight: 700, letterSpacing: 1, fontFamily: "monospace" }}>{id}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {meetingLocked && <span style={styles.lockIndicator}>🔒 Locked</span>}
            {remoteSharingScreen && <span style={styles.screenIndicator}>📺 {screenSharerName} is sharing</span>}
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13 }}>
              <UsersIcon />{participants.length} in call
            </div>
            <button
              onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
              style={{ ...styles.headerBtn, background: showParticipants ? "#6366f120" : "transparent", color: showParticipants ? "#a5b4fc" : "#94a3b8" }}
            >
              <UsersIcon /> People
            </button>
            <button
              onClick={() => { setShowChat(!showChat); setShowParticipants(false); if (!showChat) setUnreadCount(0); }}
              style={{ ...styles.headerBtn, background: showChat ? "#6366f120" : "transparent", color: showChat ? "#a5b4fc" : "#94a3b8", position: "relative" }}
            >
              <ChatIcon /> Chat
              {unreadCount > 0 && !showChat && (
                <span style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={styles.body}>
          {/* ── VIDEO GRID ── */}
          <div style={styles.videoArea}>
            <div style={{ ...styles.videoGrid, gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
              {/* LOCAL TILE */}
              <div style={styles.videoTile}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    ...styles.videoEl,
                    display: videoOn ? "block" : "none",
                  }}
                />
                {!videoOn && (
                  <div style={styles.avatarWrap}>
                    <AvatarTile name={currentUser.name} />
                  </div>
                )}
                <div style={styles.videoNameTag}>
                  {screenSharing && <span style={styles.screenBadge}>📺 Screen</span>}
                  <span>{currentUser.name} (You)</span>
                  <span style={{ marginLeft: 8, opacity: 0.6, fontSize: 11 }}>{micOn ? "🎤" : "🔇"}</span>
                </div>
              </div>

              {remoteEntries.map((socketId) => {
                const info = participants.find((p) => p.socketId === socketId);
                const name = info?.name || "Guest";

                const isVideoActive = info?.videoOn !== false;

                return (
                  <div key={socketId}>
                    {isVideoActive ? (
                      <RemoteVideo
                        key={`${socketId}-${isVideoActive}`}
                        stream={remoteStreams[socketId]}
                        name={name}
                        isSharingScreen={
                          remoteSharingScreen &&
                          name === screenSharerName
                        }
                      />
                    ) : (
                      <div style={styles.videoTile}>
                        <div style={styles.avatarWrap}>
                          <AvatarTile name={name} />
                        </div>

                        <div style={styles.videoNameTag}>
                          <span>{name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SIDEBAR (Participants or Chat) ── */}
          {(showParticipants || showChat) && (
            <aside style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{showParticipants ? "People" : "Chat"}</span>
                <button onClick={() => { setShowParticipants(false); setShowChat(false); }} style={styles.closeBtn}>✕</button>
              </div>

              {showParticipants && (
                <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
                  {participants.map((p) => (
                    <ParticipantRow key={p.userId} participant={p} isHost={isHost} currentUserId={currentUser._id} meetingId={id} currentUser={currentUser} />
                  ))}
                </div>
              )}

              {showChat && (
                <ChatSidebar
                  messages={messages}
                  onSendMessage={sendChatMessage}
                  onClose={() => setShowChat(false)}
                  currentUserId={currentUser._id}
                  embedded
                />
              )}
            </aside>
          )}
        </div>

        {/* ── CONTROLS BAR ── */}
        <footer style={styles.footer}>
          <div style={styles.controlsInner}>
            <CtrlBtn
              onClick={() => { }}
              label="Connected"
              active
            >
              <CallIcon />
            </CtrlBtn>

            <div style={styles.divider} />

            <CtrlBtn onClick={toggleMic} label={micOn ? "Mute" : "Unmute"} active={micOn}>
              <MicIcon on={micOn} />
            </CtrlBtn>

            <CtrlBtn onClick={toggleVideo} label={videoOn ? "Stop Video" : "Start Video"} active={videoOn}>
              <CameraIcon on={videoOn} />
            </CtrlBtn>

            <CtrlBtn
              onClick={screenSharing ? stopScreenShare : startScreenShare}
              label={screenSharing ? "Stop Share" : "Share Screen"}
              active={screenSharing}
            >
              <ScreenIcon />
            </CtrlBtn>

            {isHost && (
              <CtrlBtn
                onClick={() => socket.emit(meetingLocked ? "unlock-meeting" : "lock-meeting", { meetingId: id, userId: currentUser._id })}
                label={meetingLocked ? "Unlock" : "Lock"}
                active={meetingLocked}
              >
                <LockIcon locked={meetingLocked} />
              </CtrlBtn>
            )}

            <div style={styles.divider} />

            <CtrlBtn onClick={leaveCall} label="Leave" danger>
              <PhoneOffIcon />
            </CtrlBtn>
          </div>
        </footer>
      </div>
    </>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0a0f1e",
    color: "#f1f5f9",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
    zIndex: 10,
  },
  logo: {
    width: 36, height: 36,
    background: "#6366f115",
    border: "1px solid #6366f130",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  lockIndicator: {
    background: "#ef444415",
    border: "1px solid #ef444430",
    color: "#fca5a5",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  screenIndicator: {
    background: "#6366f115",
    border: "1px solid #6366f130",
    color: "#a5b4fc",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  headerBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px",
    border: "1px solid #1e293b",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  videoArea: {
    flex: 1,
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  videoGrid: {
    display: "grid",
    gap: 12,
    width: "100%",
    maxHeight: "100%",
  },
  videoTile: {
    position: "relative",
    background: "#0f172a",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #1e293b",
    aspectRatio: "16 / 9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.2s",
  },
  videoEl: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  avatarWrap: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0f172a",
  },
  videoNameTag: {
    position: "absolute",
    bottom: 10, left: 10,
    display: "flex", alignItems: "center", gap: 6,
    background: "#00000080",
    backdropFilter: "blur(8px)",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    color: "#f1f5f9",
  },
  screenBadge: {
    background: "#6366f1",
    padding: "1px 7px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
  },
  sidebar: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
    borderLeft: "1px solid #1e293b",
    flexShrink: 0,
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 16,
    padding: 4,
    borderRadius: 6,
    lineHeight: 1,
  },
  participantRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    borderBottom: "1px solid #1e293b10",
    gap: 8,
  },
  youBadge: {
    marginLeft: 6,
    background: "#6366f120",
    color: "#a5b4fc",
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 8,
    letterSpacing: 0.5,
  },
  hostBadge: {
    marginLeft: 6,
    background: "#f9731620",
    color: "#fdba74",
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 8,
    letterSpacing: 0.5,
  },
  hostBtn: {
    border: "none",
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  footer: {
    background: "#0f172a",
    borderTop: "1px solid #1e293b",
    padding: "14px 24px",
    flexShrink: 0,
    display: "flex",
    justifyContent: "center",
  },
  controlsInner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  ctrlBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    padding: "10px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.15s",
    minWidth: 64,
  },
  divider: {
    width: 1,
    height: 40,
    background: "#1e293b",
    margin: "0 4px",
  },
};

export default MeetingRoom;
