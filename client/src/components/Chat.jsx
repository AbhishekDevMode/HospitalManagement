import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Send, Circle } from "lucide-react";
import axios from "axios";

export default function Chat({ appointmentId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

    if (user && user.token) {
      axios
        .get(`${API_BASE}/api/messages/${appointmentId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching message history:", err));
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket chat server");
        setIsConnected(true);
        client.subscribe(`/topic/appointment/${appointmentId}`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket chat server");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setIsConnected(false);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [appointmentId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (stompClient && isConnected) {
      const msg = {
        appointmentId: Number(appointmentId),
        senderId: currentUserId,
        content: input.trim(),
        timestamp: new Date().toISOString(),
      };
      try {
        stompClient.publish({
          destination: "/app/chat",
          body: JSON.stringify(msg),
        });
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.warn("Cannot send message: Not connected to chat server");
      alert("Please wait, connecting to chat server...");
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-slate-200 rounded-2xl overflow-hidden bg-white mt-8 shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-800">Live Consultation Chat</h3>
          <p className="text-xs text-slate-500">Appointment ID: #{appointmentId}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-white border border-slate-200">
          <Circle
            size={8}
            className={isConnected ? "fill-green-500 text-green-500" : "fill-amber-500 text-amber-500 animate-pulse"}
          />
          <span className={isConnected ? "text-green-700" : "text-amber-700"}>
            {isConnected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-12 text-sm">
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = Number(m.senderId) === Number(currentUserId);
            return (
              <div
                key={m.id || i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="break-words">{m.content}</div>
                  {m.timestamp && (
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isMe ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t border-slate-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connecting to chat server..."}
          disabled={!isConnected}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 text-sm"
        />
        <button
          type="submit"
          disabled={!isConnected || !input.trim()}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
}
