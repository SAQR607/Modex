import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Chat = ({ roomType = 'global', teamId = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    if (roomType === 'global') {
      newSocket.on('global-message', (data) => {
        setMessages((prev) => [...prev, data]);
      });
    } else if (roomType === 'team' && teamId) {
      newSocket.on('team-message', (data) => {
        setMessages((prev) => [...prev, data]);
      });
      newSocket.on('team-file-upload', (data) => {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            message: `Uploaded file: ${data.fileName}`,
            isFile: true
          }
        ]);
      });
    }

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, roomType, teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    if (roomType === 'global') {
      socket.emit('global-message', { message });
    } else if (roomType === 'team') {
      socket.emit('team-message', { message });
    }

    setMessage('');
  };

  if (!isAuthenticated) {
    return <div>Please login to use chat</div>;
  }

  return (
    <div style={{ height: '500px', display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h3>{roomType === 'global' ? 'Global Chat' : 'Team Chat'}</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.firstName} {msg.lastName}</strong>
            <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
            <div>{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

