import { useEffect, useRef } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function MessageList({
  messages,
  currentUserId,
  isGroup,
  lastReadByOthersId,
  hasMore,
  loadingMore,
  onLoadMore,
  typingUsers
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    // Only auto-scroll to bottom when a new message arrives at the end,
    // not when older messages get prepended by "load more".
    if (messages.length > prevMessageCount.current) {
      const wasNearBottom =
        containerRef.current &&
        containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight < 200;
      if (wasNearBottom || prevMessageCount.current === 0) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  const isMessageSeen = (message) =>
    lastReadByOthersId && String(message.messageId) <= String(lastReadByOthersId);

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, bgcolor: '#f4f5f7' }}>
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button size="small" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? <CircularProgress size={18} /> : 'تحميل رسائل أقدم'}
          </Button>
        </Box>
      )}
      {messages.map((m, idx) => {
        const isOwn = String(m.senderId) === String(currentUserId);
        const prev = messages[idx - 1];
        const showSenderName = isGroup && (!prev || String(prev.senderId) !== String(m.senderId));
        return (
          <MessageBubble
            key={m.messageId || m.tempId}
            message={m}
            isOwn={isOwn}
            showSenderName={showSenderName}
            seen={isOwn && isMessageSeen(m)}
            pending={m.pending}
          />
        );
      })}
      {typingUsers.length > 0 && <TypingIndicator />}
      <div ref={bottomRef} />
    </Box>
  );
}
