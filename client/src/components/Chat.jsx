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
  
    const user = JSON.parse(localStorage.getItem('user'));
    axios.get(`http://localhost:8081/api/messages/${appointmentId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setMessages(res.data))
      .catch(err => console.error(err));

    const socket = new SockJS('http://localhost:8081/ws');
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

  return (
    <div className="flex flex-col h-[500px] border border-slate-200 rounded-2xl overflow-hidden bg-white mt-8 shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800">Live Consultation Chat</h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.senderId === currentUserId ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

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
