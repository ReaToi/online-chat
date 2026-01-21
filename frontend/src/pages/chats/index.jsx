import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationApi } from '@/entities/conversation/api/conversationApi';
import { userApi } from '@/entities/user/api/userApi';
import { Loader } from '@/shared/ui/Loader/Loader';
import { Button } from '@/shared/ui/Button/Button';
import { CreateChat } from '@/features/chat/create-chat';
import { removeToken } from '@/shared/lib/utils/cookies';
import './Chats.css';

export const ChatsPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [chatsData, userData] = await Promise.all([
        conversationApi.getList(),
        userApi.getMe(),
      ]);
      setChats(chatsData || []);
      setCurrentUser(userData);
    } catch (err) {
      if (err.response?.status === 401) {
        removeToken();
        navigate('/login');
      } else {
        setError('Ошибка при загрузке данных');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (chatId) => {
    navigate(`/chats/${chatId}`);
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const handleChatCreated = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    navigate(`/chats/${newChat.id}`);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="chats-page">
      <header className="chats-header">
        <div className="header-content">
          <h1>Чаты</h1>
          <div className="header-actions">
            <span className="user-info">{currentUser?.username}</span>
            <CreateChat onChatCreated={handleChatCreated} />
            <Button variant="secondary" onClick={handleLogout}>
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="chats-main">
        {error && <div className="error-message">{error}</div>}
        {chats.length === 0 ? (
          <div className="empty-state">
            <p>У вас пока нет чатов</p>
            <CreateChat onChatCreated={handleChatCreated} />
          </div>
        ) : (
          <div className="chats-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="chat-info">
                  <h3 className="chat-title">
                    {chat.title || `Чат #${chat.id}`}
                  </h3>
                  <span className="chat-type">
                    {chat.type === 'private' ? 'Личный' : 'Групповой'}
                  </span>
                </div>
                {chat.last_message && (
                  <div className="chat-preview">
                    {chat.last_message.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

