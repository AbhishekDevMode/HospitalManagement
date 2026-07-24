import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send } from 'lucide-react';
import axios from 'axios';

export default function Chat({ appointmentId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // Fetch chat history
    const user = JSON.parse(localStorage.getItem('user'));
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    axios.get(`${API_BASE}/api/messages/${appointmentId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setMessages(res.data))
      .catch(err => console.error(err));

    const WS_BASE = API_BASE.replace(/^http/, 'ws');
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to chat');
        client.subscribe(`/topic/appointment/${appointmentId}`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      },
    });

    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, [appointmentId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && stompClient) {
      const msg = {
        appointmentId,
        senderId: currentUserId,
        content: input,
      };
      stompClient.publish({ destination: '/app/chat', body: JSON.stringify(msg) });
      setInput('');
    }
  };

  const [isVideoMode, setIsVideoMode] = useState(false);

  return (
    <div className="flex flex-col h-[500px] border border-slate-200 rounded-2xl overflow-hidden bg-white mt-8 shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Live Consultation {isVideoMode ? "Video" : "Chat"}</h3>
        <button 
          onClick={() => setIsVideoMode(!isVideoMode)}
          className={`px-3 py-1 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${isVideoMode ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
        >
          {isVideoMode ? "End Video" : "Start Video Call"}
        </button>
      </div>
      
      {isVideoMode ? (
        <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center text-white relative">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full mb-4 mx-auto animate-pulse flex items-center justify-center border-4 border-slate-700">
              <span className="text-3xl font-bold text-slate-500">M</span>
            </div>
            <p className="text-slate-300 font-medium">Connecting to secure WebRTC stream...</p>
            <p className="text-slate-500 text-sm mt-2">(Mock Video Interface)</p>
          </div>
          <div className="absolute bottom-4 right-4 w-32 h-40 bg-slate-800 border-2 border-slate-700 rounded-xl overflow-hidden">
             <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">You</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.senderId === currentUserId ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
          <Send size={20} className="ml-1" />
        </button>
      </form>
    </div>
  );
}
