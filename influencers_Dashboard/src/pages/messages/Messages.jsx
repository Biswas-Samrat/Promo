import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Container,
  CircularProgress,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  TextField,
  Button,
  CssBaseline,
  IconButton,
  Badge,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DownloadIcon from '@mui/icons-material/Download';
import io from 'socket.io-client';

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
    },
  },
}));

// ListItem for contacts in the sidebar with pointer cursor
const NoHoverListItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer', // Changed to pointer
  '&:not(.Mui-selected):hover': {
    backgroundColor: theme.palette.action.hover, // Add a hover effect for better UX
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, isSender }) => ({
  maxWidth: '70%',
  padding: theme.spacing(0.8, 1.2), // Reduced padding slightly
  borderRadius: theme.shape.borderRadius,
  wordWrap: 'break-word',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column', // Messages content and timestamp stacked vertically
  marginBottom: theme.spacing(0.5),
  boxShadow: theme.shadows[1], // Subtle shadow for bubble effect

  // Sender styles (Green bubble)
  ...(isSender && {
    backgroundColor: '#DCF8C6', // WhatsApp-like green
    color: theme.palette.text.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    // Arrow for sender
    '&::after': {
      content: '""',
      position: 'absolute',
      right: -8, // Position the arrow to the right edge
      bottom: 0, // Align with the bottom of the bubble
      width: 0,
      height: 0,
      border: '8px solid transparent',
      borderLeftColor: '#DCF8C6',
      borderBottomColor: '#DCF8C6',
      borderTopLeftRadius: theme.shape.borderRadius,
    },
  }),
  // Receiver styles (Grey bubble)
  ...(!isSender && {
    backgroundColor: theme.palette.grey[200], // WhatsApp-like grey
    color: theme.palette.text.primary,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    // Arrow for receiver
    '&::after': {
      content: '""',
      position: 'absolute',
      left: -8, // Position the arrow to the left edge
      bottom: 0, // Align with the bottom of the bubble
      width: 0,
      height: 0,
      border: '8px solid transparent',
      borderRightColor: theme.palette.grey[200],
      borderBottomColor: theme.palette.grey[200],
      borderTopRightRadius: theme.shape.borderRadius,
    },
  }),
}));

// Initialize socket with reconnection options
const socket = io("https://promo-ke7k.onrender.com", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  autoConnect: true,
  transports: ['websocket']
});

// Helper function to sort messages by timestamp (oldest first)
const sortMessages = (messages) => {
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });
};

const Messages = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unseenMessageCounts, setUnseenMessageCounts] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Optimized contact sorting for the sidebar
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      // Prioritize contacts with unseen messages, then by last message time
      const unseenA = unseenMessageCounts[a._id] || 0;
      const unseenB = unseenMessageCounts[b._id] || 0;

      if (unseenA > 0 && unseenB === 0) return -1;
      if (unseenA === 0 && unseenB > 0) return 1;

      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [contacts, unseenMessageCounts]);

  // Fetch user data and initialize socket
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://promo-ke7k.onrender.com/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);

        const initialContacts = (res.data.connections || []).map(contact => ({
          ...contact,
          isOnline: false,
          unseenCount: 0,
          lastMessageAt: contact.lastMessageAt || null,
        }));

        setContacts(initialContacts);
        setUnseenMessageCounts({});

        if (res.data?._id) {
          socket.emit('registerUser', res.data._id);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();

    // Socket connection status handlers
    const onConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
      if (user?._id) {
        socket.emit('registerUser', user._id);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [user?._id]);

  // Socket event listeners
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (!user || !message.senderId || !message.receiverId) return;

      const isMessageForSelectedChat = selectedUser && (
        (message.senderId._id === selectedUser._id && message.receiverId._id === user._id) ||
        (message.receiverId._id === selectedUser._id && message.senderId._id === user._id)
      );

      if (isMessageForSelectedChat) {
        setMessageList(prev => {
          const messageAlreadyExists = prev.some(msg => msg._id === message._id);
          if (messageAlreadyExists) {
            return prev;
          }
          const newState = [...prev, {
            _id: message._id,
            sender: message.senderId.name,
            senderId: message.senderId._id,
            senderPic: message.senderId.profilePicture || "",
            content: message.text,
            image: message.image,
            timestamp: message.timestamp,
            seen: message.seen,
            receiverId: message.receiverId._id
          }];
          return sortMessages(newState);
        });

        if (message.receiverId._id === user._id) {
          socket.emit('markMessagesAsSeen', {
            currentUserId: user._id,
            otherUserId: message.senderId._id,
          });
        }
      } else if (message.receiverId._id === user._id) {
        setUnseenMessageCounts(prev => ({
          ...prev,
          [message.senderId._id]: (prev[message.senderId._id] || 0) + 1
        }));
      }

      setContacts(prev => prev.map(contact => {
        if (contact._id === message.senderId._id || contact._id === message.receiverId._id) {
          return { ...contact, lastMessageAt: message.timestamp };
        }
        return contact;
      }));
    };

    const handleMessageSentConfirmation = (message) => {
      if (!user) return;

      setMessageList(prev => {
        const existingIndex = prev.findIndex(msg => msg._id === message.tempId);

        if (existingIndex > -1) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = {
            ...updatedMessages[existingIndex],
            _id: message._id,
            timestamp: message.timestamp,
            seen: message.seen,
            image: message.image,
            isTemp: false,
          };
          return sortMessages(updatedMessages);
        } else {
          const isMessageForSelectedChat = selectedUser && (
            (message.senderId === selectedUser._id && message.receiverId === user._id) ||
            (message.receiverId === selectedUser._id && message.senderId === user._id)
          );
          if (isMessageForSelectedChat) {
            const messageAlreadyExists = prev.some(msg => msg._id === message._id);
            if (messageAlreadyExists) return prev;
            const newState = [...prev, {
              _id: message._id,
              sender: user.name,
              senderId: user._id,
              senderPic: user.profilePicture || "",
              content: message.text,
              image: message.image,
              timestamp: message.timestamp,
              seen: message.seen,
              receiverId: message.receiverId,
            }];
            return sortMessages(newState);
          }
          return prev;
        }
      });

      setContacts(prev => prev.map(contact =>
        contact._id === message.receiverId
          ? { ...contact, lastMessageAt: message.timestamp }
          : contact
      ));
    };

    const handleMessagesSeen = ({ seenBy, count }) => {
      setMessageList(prev => sortMessages(prev.map(msg =>
        msg.senderId === user._id && msg.receiverId === seenBy && !msg.seen
          ? { ...msg, seen: true }
          : msg
      )));
    };

    const handleTypingEvent = (senderId) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(true);
      }
    };

    const handleStopTypingEvent = (senderId) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(false);
      }
    };

    const handleOnlineUsers = (onlineUserIds) => {
      setContacts(prev => prev.map(contact => ({
        ...contact,
        isOnline: onlineUserIds.includes(contact._id),
      })));

      if (selectedUser) {
        setSelectedUser(prev => ({
          ...prev,
          isOnline: onlineUserIds.includes(prev._id),
        }));
      }
    };

    const handleError = (err) => {
      console.error('Socket error:', err);
    };

    const handleMessageError = (errorMsg) => {
      console.error('Failed to send message:', errorMsg);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSentConfirmation', handleMessageSentConfirmation);
    socket.on('messagesSeenByRecipient', handleMessagesSeen);
    socket.on('typing', handleTypingEvent);
    socket.on('stopTyping', handleStopTypingEvent);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('connect_error', handleError);
    socket.on('messageError', handleMessageError);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSentConfirmation', handleMessageSentConfirmation);
      socket.off('messagesSeenByRecipient', handleMessagesSeen);
      socket.off('typing', handleTypingEvent);
      socket.off('stopTyping', handleStopTypingEvent);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('connect_error', handleError);
      socket.off('messageError', handleMessageError);
    };
  }, [user, selectedUser]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messageList, isTyping]);

  // Handle user selection
  const handleSelectUser = async (contact) => {
    try {
      setSelectedUser(contact);
      setMessageList([]);
      setIsTyping(false);

      if (!user || !contact) return;

      const token = localStorage.getItem("token");
      const res = await axios.get(`https://promo-ke7k.onrender.com/api/messages/${contact._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const messages = res.data.map(msg => ({
        _id: msg._id,
        sender: msg.senderId.name,
        senderId: msg.senderId._id,
        senderPic: msg.senderId.profilePicture || "",
        content: msg.text,
        image: msg.image,
        timestamp: msg.timestamp,
        seen: msg.seen,
        receiverId: msg.receiverId._id
      }));

      setMessageList(sortMessages(messages));

      socket.emit('markMessagesAsSeen', {
        currentUserId: user._id,
        otherUserId: contact._id,
      });

      setUnseenMessageCounts(prev => ({
        ...prev,
        [contact._id]: 0
      }));
    } catch (err) {
      console.error("Error selecting user:", err);
      setMessageList([]);
    }
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const textContent = newMessage.trim();
    const file = fileInputRef.current?.files?.[0];

    if (!textContent && !file) return;
    if (!user || !selectedUser) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const currentClientTimestamp = new Date().toISOString();

    const tempMessage = {
      _id: tempId,
      sender: user.name,
      senderId: user._id,
      senderPic: user.profilePicture || "",
      content: textContent || null,
      image: null,
      timestamp: currentClientTimestamp,
      seen: false,
      isTemp: true,
      receiverId: selectedUser._id
    };

    setMessageList(prev => sortMessages([...prev, tempMessage]));

    try {
      if (file) {
        const formData = new FormData();
        formData.append('chatImage', file);
        formData.append('senderId', user._id);
        formData.append('receiverId', selectedUser._id);
        formData.append('tempId', tempId);
        formData.append('text', textContent || '');

        const token = localStorage.getItem("token");
        await axios.post(
          "https://promo-ke7k.onrender.com/api/chat/upload-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          }
        );
      } else {
        const messagePayload = {
          senderId: user._id,
          receiverId: selectedUser._id,
          text: textContent,
          tempId: tempId,
        };
        socket.emit('sendMessage', messagePayload);
      }

      setNewMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      socket.emit('stopTyping', { senderId: user._id, receiverId: selectedUser._id });

    } catch (err) {
      console.error("Error sending message:", err);
      setMessageList(prev => prev.filter(msg => msg._id !== tempId));
    }
  };

  // Typing indicator handler for input field
  const handleMessageInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!user || !selectedUser) return;

    socket.emit('typing', {
      senderId: user._id,
      receiverId: selectedUser._id
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: user._id,
        receiverId: selectedUser._id
      });
    }, 1500);
  };

  // Format timestamp (e.g., "10:30 AM")
  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return "";
    }
  };

  // Download handler for images
  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'image');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ height: "100vh", display: "flex", border: "1px solid #e0e0e0", borderRadius: 2, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box sx={{ width: "300px", height: "100%", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", bgcolor: 'background.paper' }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Chats
                <Typography variant="caption" sx={{ ml: 1, color: isConnected ? '#44b700' : 'error.main' }}>
                  {isConnected ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            }
            sx={{ bgcolor: "primary.main", color: "white", flexShrink: 0 }}
          />
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <List disablePadding>
              {sortedContacts.length > 0 ? (
                sortedContacts.map((contact) => (
                  <NoHoverListItem
                    key={contact._id}
                    onClick={() => handleSelectUser(contact)}
                    selected={selectedUser?._id === contact._id}
                    disableRipple
                  >
                    <ListItemAvatar>
                      <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant={contact.isOnline ? "dot" : "standard"}
                      >
                        <Avatar src={contact.profilePicture} alt={contact.name} />
                      </StyledBadge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.name}
                      secondary={
                        <Typography noWrap variant="body2" color="text.secondary">
                          {contact.email}
                        </Typography>
                      }
                    />
                    {unseenMessageCounts[contact._id] > 0 && (
                      <Badge
                        badgeContent={unseenMessageCounts[contact._id]}
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </NoHoverListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No connected users" sx={{ textAlign: 'center', py: 2 }} />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>

        {/* Chat Box */}
        <Box sx={{ flexGrow: 1, height: "100%", display: "flex", flexDirection: "column", bgcolor: 'background.default' }}>
          <CardHeader
            title={
              selectedUser ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {selectedUser.name}
                  <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant={selectedUser.isOnline ? "dot" : "standard"}
                    sx={{ ml: 1 }}
                  />
                  {isTyping && (
                    <Typography variant="caption" sx={{ ml: 1, fontStyle: 'italic' }}>
                      typing...
                    </Typography>
                  )}
                </Box>
              ) : (
                "Select a user to start chatting"
              )
            }
            sx={{ bgcolor: "secondary.main", color: "white", flexShrink: 0 }}
          />
          <CardContent sx={{ flexGrow: 1, p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box
              ref={messagesEndRef}
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 2,
                py: 2,
                minHeight: 0,
                // WhatsApp-like scrollbar (hidden)
                '&::-webkit-scrollbar': {
                  width: '6px',
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              {messageList.map((msg, idx) => {
                const isSender = msg.senderId === user._id;
                const profilePic = isSender ? user.profilePicture : selectedUser?.profilePicture;

                return (
                  <Box
                    key={msg._id || idx} // Use msg._id for stable keys
                    sx={{
                      mb: 2,
                      display: 'flex',
                      flexDirection: isSender ? 'row-reverse' : 'row',
                      alignItems: 'flex-end', // Align avatars with the bottom of the bubble
                    }}
                  >
                    <Avatar
                      src={profilePic}
                      alt={msg.sender}
                      sx={{ width: 32, height: 32, mx: 1 }}
                    />
                    <MessageBubble isSender={isSender}>
                      {msg.content && <Typography variant="body2">{msg.content}</Typography>}
                      {msg.image && (
                        <Box sx={{ position: 'relative', mt: msg.content ? 1 : 0 }}>
                          <img
                            src={msg.image}
                            alt="chat"
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                          />
                          <IconButton
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                              bgcolor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                            }}
                            onClick={() => downloadImage(msg.image)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      {/* Timestamp and Seen Status positioned inside bubble at the bottom right */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end', // Align to end of bubble
                        width: '100%',
                        mt: msg.content || msg.image ? 0.5 : 0, // Margin top if there's content/image
                        ml: 'auto', // Push to the right
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {formatTimestamp(msg.timestamp)}
                        </Typography>
                        {isSender && (
                          msg.seen ? (
                            <DoneAllIcon sx={{ fontSize: 14, color: '#4FC3F7', ml: 0.5 }} /> // WhatsApp blue seen
                          ) : (
                            <CheckIcon sx={{ fontSize: 14, color: 'text.secondary', ml: 0.5 }} />
                          )
                        )}
                      </Box>
                    </MessageBubble>
                  </Box>
                );
              })}
            </Box>

            {/* Message Input */}
            {selectedUser && (
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  display: "flex",
                  p: 2,
                  borderTop: "1px solid #e0e0e0",
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                <IconButton
                  color="primary"
                   style={{display:"none"}}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mr: 1 }}
                >
                  <AttachFileIcon />
                </IconButton>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={handleMessageInputChange}
                  sx={{ mr: 1 }}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!newMessage.trim() && (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0)}
                >
                  Send
                </Button>
              </Box>
            )}
          </CardContent>
        </Box>
      </Box>
    </>
  );
};

export default Messages;
