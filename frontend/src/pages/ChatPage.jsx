import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import EmptyState from '../components/EmptyState';
import NewChatDialog from '../components/NewChatDialog';
import NewGroupDialog from '../components/NewGroupDialog';
import http from '../api/http';
import { getSocket } from '../api/socket';
import { useUser } from '../context/UserContext';

export default function ChatPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messagesByConv, setMessagesByConv] = useState({}); // id -> { items, hasMore, loadingMore }
  const [typingByConv, setTypingByConv] = useState({}); // id -> [{userId, nickname}]
  const [lastReadOthers, setLastReadOthers] = useState({}); // id -> latest messageId read by any other member
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.conversationId === selectedId) || null,
    [conversations, selectedId]
  );

  const loadConversations = useCallback(async () => {
    const { data } = await http.get('/conversations');
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (conversationId, before) => {
    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: { ...(prev[conversationId] || { items: [], hasMore: true }), loadingMore: true }
    }));
    const { data } = await http.get(`/conversations/${conversationId}/messages`, {
      params: { limit: 30, ...(before ? { before } : {}) }
    });
    setMessagesByConv((prev) => {
      const existing = prev[conversationId]?.items || [];
      return {
        ...prev,
        [conversationId]: {
          items: before ? [...data, ...existing] : data,
          hasMore: data.length === 30,
          loadingMore: false
        }
      };
    });
  }, []);

  // Load messages + mark-as-read whenever the selected conversation changes.
  useEffect(() => {
    if (!selectedId) return;
    if (!messagesByConv[selectedId]) loadMessages(selectedId);
    const socket = getSocket();
    const items = messagesByConv[selectedId]?.items;
    const last = items && items.length ? items[items.length - 1] : null;
    if (socket && last) {
      socket.emit('message:read', { conversationId: selectedId, messageId: last.messageId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, messagesByConv[selectedId]?.items?.length]);

  // ---- Socket event wiring ----
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onMessageNew = (message) => {
      setMessagesByConv((prev) => {
        const bucket = prev[message.conversationId] || { items: [], hasMore: true };
        // Reconcile the optimistic message we already rendered, if any.
        const withoutTemp = bucket.items.filter((m) => !(message.tempId && m.tempId === message.tempId));
        return { ...prev, [message.conversationId]: { ...bucket, items: [...withoutTemp, message] } };
      });
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.conversationId === message.conversationId
            ? {
                ...c,
                lastMessage: { content: message.content, senderId: message.senderId, createdAt: message.createdAt },
                unreadCount:
                  selectedIdRef.current === message.conversationId || String(message.senderId) === String(user.userId)
                    ? c.unreadCount
                    : (c.unreadCount || 0) + 1,
                updatedAt: message.createdAt
              }
            : c
        );
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      if (selectedIdRef.current === message.conversationId && String(message.senderId) !== String(user.userId)) {
        socket.emit('message:read', { conversationId: message.conversationId, messageId: message.messageId });
      }
    };

    const onReadAck = ({ conversationId, userId, messageId }) => {
      if (String(userId) === String(user.userId)) return; // our own ack, ignore
      setLastReadOthers((prev) => ({
        ...prev,
        [conversationId]:
          !prev[conversationId] || String(messageId) > String(prev[conversationId]) ? messageId : prev[conversationId]
      }));
    };

    const onTypingStart = ({ conversationId, userId, nickname }) => {
      if (String(userId) === String(user.userId)) return;
      setTypingByConv((prev) => {
        const list = prev[conversationId] || [];
        if (list.some((u) => u.userId === userId)) return prev;
        return { ...prev, [conversationId]: [...list, { userId, nickname }] };
      });
    };

    const onTypingStop = ({ conversationId, userId }) => {
      setTypingByConv((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((u) => u.userId !== userId)
      }));
    };

    const onPresenceUpdate = ({ userId, online }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.otherUser?.userId === userId ? { ...c, otherUser: { ...c.otherUser, online } } : c
        )
      );
    };

    const onConversationNew = () => loadConversations();

    const onConversationUpdated = ({ conversationId, name }) => {
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === conversationId ? { ...c, name } : c))
      );
    };

    socket.on('message:new', onMessageNew);
    socket.on('message:read:ack', onReadAck);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('presence:update', onPresenceUpdate);
    socket.on('conversation:new', onConversationNew);
    socket.on('conversation:updated', onConversationUpdated);

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('message:read:ack', onReadAck);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('presence:update', onPresenceUpdate);
      socket.off('conversation:new', onConversationNew);
      socket.off('conversation:updated', onConversationUpdated);
    };
  }, [user, loadConversations]);

  const handleSend = (text) => {
    const socket = getSocket();
    if (!socket || !selectedId) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      tempId,
      conversationId: selectedId,
      senderId: user.userId,
      senderNickname: user.nickname,
      content: text,
      createdAt: new Date().toISOString(),
      pending: true
    };
    setMessagesByConv((prev) => {
      const bucket = prev[selectedId] || { items: [], hasMore: true };
      return { ...prev, [selectedId]: { ...bucket, items: [...bucket.items, optimisticMessage] } };
    });
    socket.emit('message:send', { conversationId: selectedId, content: text, tempId });
  };

  const handleStartDirectChat = async (targetUserId) => {
    const { data } = await http.post('/conversations/direct', { targetUserId });
    setNewChatOpen(false);
    await loadConversations();
    setSelectedId(data.conversationId);
  };

  const handleCreateGroup = async (name, memberIds) => {
    const { data } = await http.post('/conversations/group', { name, memberIds });
    setNewGroupOpen(false);
    await loadConversations();
    setSelectedId(data.conversationId);
  };

  const handleRenameGroup = async (conversationId, name) => {
    await http.patch(`/conversations/${conversationId}`, { name });
    setConversations((prev) =>
      prev.map((c) => (c.conversationId === conversationId ? { ...c, name } : c))
    );
  };

  const currentMessages = selectedId ? messagesByConv[selectedId]?.items || [] : [];
  const currentTyping = selectedId ? typingByConv[selectedId] || [] : [];
  const typingText = currentTyping.length
    ? currentTyping.length === 1
      ? `${currentTyping[0].nickname} يكتب الآن...`
      : 'أكثر من شخص يكتب الآن...'
    : '';

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setConversations((prev) => prev.map((c) => (c.conversationId === id ? { ...c, unreadCount: 0 } : c)));
        }}
        onOpenNewChat={() => setNewChatOpen(true)}
        onOpenNewGroup={() => setNewGroupOpen(true)}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              typingText={typingText}
              onRenameGroup={handleRenameGroup}
            />
            <MessageList
              messages={currentMessages}
              currentUserId={user.userId}
              isGroup={selectedConversation.type === 'group'}
              lastReadByOthersId={lastReadOthers[selectedId]}
              hasMore={!!messagesByConv[selectedId]?.hasMore}
              loadingMore={!!messagesByConv[selectedId]?.loadingMore}
              onLoadMore={() => loadMessages(selectedId, currentMessages[0]?.messageId)}
              typingUsers={currentTyping}
            />
            <MessageInput
              onSend={handleSend}
              onTypingStart={() => getSocket()?.emit('typing:start', { conversationId: selectedId })}
              onTypingStop={() => getSocket()?.emit('typing:stop', { conversationId: selectedId })}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </Box>

      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} onStartChat={handleStartDirectChat} />
      <NewGroupDialog open={newGroupOpen} onClose={() => setNewGroupOpen(false)} onCreateGroup={handleCreateGroup} />
    </Box>
  );
}
