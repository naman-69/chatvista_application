import React, { useState } from 'react';
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import ScrollableFeed from "react-scrollable-feed";
import "./style.css";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages, onDelete }) => {
  const { user } = ChatState();
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleDelete = (messageId) => {
    // Call the onDelete callback with the messageId
    onDelete && onDelete(messageId);
    setSelectedMessage(null); // Clear selected message after deletion
  };

  const handleChatClick = (messageId) => {
    // Toggle selection of the chat message
    setSelectedMessage(selectedMessage === messageId ? null : messageId);
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div
            style={{ display: "flex", flexDirection: "column" }}
            key={m._id}
            onClick={() => handleChatClick(m._id)}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEd3F8" : "#B3F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  borderRadius: "12px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  fontSize: "18px",
                  position: "relative",
                }}
                className="chat-message"
              >
                {m.content}
                {selectedMessage === m._id && m.sender._id === user._id && (
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    position="absolute"
                    top="0"
                    right="0"
                    onClick={() => handleDelete(m._id)}
                  />
                )}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                color: "#999",
                marginTop: "5px",
                alignSelf: m.sender._id === user._id ? "flex-end" : "flex-start",
              }}
            >
              {new Date(m.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
