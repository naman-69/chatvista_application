import React from "react";
import { ChatState } from "../Context/ChatProvider";
import Lottie from "react-lottie";
import countries from "./miscellaneous/countries";
import { Box, Text } from "@chakra-ui/layout";
import appLogo from "./image/app-logo1.jpg";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";

import { Icon, createIcon } from "@chakra-ui/react";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "@chakra-ui/react";
import "../App.css";
import { FormControl } from "@chakra-ui/react";

import { Input } from "@chakra-ui/input";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import "./style.css";
import io from "socket.io-client";

import animationData from "../animation/Animation - 1700225944272.json";
import { AttachmentIcon } from "@chakra-ui/icons";
import SendIcon from "@mui/icons-material/Send";
import AddReactionRoundedIcon from "@mui/icons-material/AddReactionRounded";
import "./style.css";

import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();
  const [lang, setLang] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setsocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [emojiList, setEmojiList] = useState([]);
  const [istyping, setIsTyping] = useState(false);
  const [filteredEmojiList, setFilteredEmojiList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setsocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const fileInputRef = useRef(null);
  const handleDelete = (messageId) => {
    // Filter out the message with the given messageId
    const updatedMessages = messages.filter((message) => message._id !== messageId);
    setMessages(updatedMessages);
  };

  const handleImageSelection = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      const newImageMessage = {
        content: imageUrl,
        chatId: selectedChat,
        sender: user,
        createdAt: new Date().toISOString(),
      };

      setMessages([...messages, newImageMessage]);

      // Clear the file input value
      e.target.value = null;
    }
  };

  const handleImageIconClick = () => {
    fileInputRef.current.click();
  };

  const handleLanguageSelect = async (language) => {
    // const translatedMessage = await translateMessage(newMessage, language);
    // setNewMessage(translatedMessage);
    let transLink = `https://api.mymemory.translated.net/get?q=${newMessage}&langpair=en|${language}`;
    fetch(transLink)
      .then((translate) => translate.json())
      .then((data) => {
        setNewMessage(data.responseData.translatedText);
      });
  };

  const fetchEmoji = async () => {
    try {
      const response = await fetch(
        "https://emoji-api.com/emojis?access_key=71791f34c4cb106970cb1ba19a13d41def797fec"
      );
      const data = await response.json();
      setEmojiList(data);
      setFilteredEmojiList(data);
    } catch (error) {
      console.log("Error loading emoji", error);
    }
  };
  useEffect(() => {
    fetchEmoji();
  }, []);

  const loadEmoji = () => {
    const emojiBody = document.querySelector(".emoji-body");
    if (emojiBody) {
      emojiList.forEach((emoji) => {
        const span = document.createElement("span");
        span.textContent = emoji.character;
        span.classList.add("emoji");
        emojiBody.appendChild(span);
      });
    }
  };

  useEffect(() => {
    loadEmoji();
  }, [emojiList]);

  const handleEmojiSearch = (e) => {
    const searchInput = e.target.value.toLowerCase();
    setSearchTerm(searchInput);

    if (searchInput) {
      const filteredEmojis = emojiList.filter((emoji) =>
        emoji.slug.toLowerCase().includes(searchInput)
      );
      setFilteredEmojiList(filteredEmojis);
    } else {
      // If no search input, display all emojis
      setFilteredEmojiList(emojiList);
    }
  };

  const handleEmojiSelection = (emoji) => {
    const updatedMessage = newMessage + emoji.character;
    setNewMessage(updatedMessage);
  };

  const translateMessage = async (text, targetLanguage) => {
    const url = "https://microsoft-translator-text.p.rapidapi.com/translate";
    const apiKey = "bf420af9e2msha04cfd0d9a21b27p1f0594jsn2b52bc42f7f2";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
      },
      body: [
        {
          Text: text,
        },
      ],
    };

    try {
      const response = await fetch(
        `${url}?to[0]=${targetLanguage}&api-version=3.0&profanityAction=NoAction&textType=plain`,
        options
      );
      const result = await response.json();
      return result[0]?.translations[0]?.text || text;
    } catch (error) {
      console.error(error);
      return text;
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      console.log(messages);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" || (event.type === "click" && newMessage)) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        console.log(data);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "27px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="poppins"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
              style={{ border: "0.3px solid grey" }}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    style={{ border: "0.3px solid grey" }}
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    style={{ border: "0.3px solid grey" }}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg={"white"}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
            className="chats-box"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} onDelete={handleDelete}/>
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box display="flex" alignItems="center">
                <IconButton
                  ml={2}
                  aria-label="Send Image"
                  icon={<AttachmentIcon />}
                  className="image-icon"
                  onClick={handleImageIconClick}
                  style={{ borderRadius: "12px" }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageSelection}
                />
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a Message ..."
                  value={newMessage}
                  onChange={typingHandler}
                  style={{ borderRadius: "18px" }}
                  className="msg-input"
                />
                <IconButton
                  ml={2}
                  aria-label="send-msg"
                  icon={<SendIcon />}
                  onClick={sendMessage}
                  className="send-btn"
                  style={{ borderRadius: "10px" }}
                />

                <Popover placement="bottom-end">
                  <PopoverTrigger>
                    <IconButton
                      ml={2}
                      aria-label="Emoji"
                      icon={<AddReactionRoundedIcon />}
                      className="emoji-icon"
                      style={{ borderRadius: "12px" }}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    style={{ borderRadius: "12px", justifyContent: "center" }}
                  >
                    <PopoverHeader
                      fontWeight="semibold"
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <Input
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Search Emoji"
                        onChange={handleEmojiSearch}
                        style={{
                          borderRadius: "15px",
                          justifyContent: "center",
                        }}
                        className="emoji-search"
                      />
                    </PopoverHeader>

                    <PopoverBody className="emoji-content">
                      <div className="emoji-body">
                        {searchTerm && filteredEmojiList.length === 0 ? (
                          <span>No matching emojis found</span>
                        ) : (
                          filteredEmojiList.map((emoji) => (
                            <span
                              key={emoji.slug}
                              className="emoji"
                              onClick={() => handleEmojiSelection(emoji)}
                            >
                              {emoji.character}
                            </span>
                          ))
                        )}
                      </div>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Popover placement="bottom-end" style={{ width: "25px" }}>
                  <PopoverTrigger>
                    <IconButton
                      ml={2}
                      aria-label="Emoji"
                      icon={<GTranslateIcon />}
                      className="emoji-icon"
                      style={{ borderRadius: "12px" }}
                      id="google_translate_element"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    style={{
                      borderRadius: "12px",
                      justifyContent: "center",
                      width: "190px",
                    }}
                  >
                    <PopoverHeader
                      fontWeight="semibold"
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <Input
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Search Language"
                        value={languageSearchTerm}
                        onChange={(e) => setLanguageSearchTerm(e.target.value)}
                        style={{
                          borderRadius: "15px",
                          justifyContent: "center",
                        }}
                        className="emoji-search"
                      />
                    </PopoverHeader>

                    <PopoverBody className="emoji-content">
                      <div className="emoji-body">
                        {Object.values(countries)
                          .filter((country) =>
                            country
                              .toLowerCase()
                              .includes(languageSearchTerm.toLowerCase())
                          )
                          .map((country, index) => (
                            <Text
                              key={index}
                              onClick={() => handleLanguageSelect(country)}
                              className="lange-text"
                            >
                              {country}
                            </Text>
                          ))}
                      </div>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          flexDirection={"column"}
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <img src={appLogo} alt="app-logo" className="app-logo" />
          <Text
            fontSize="3xl"
            pb={3}
            fontFamily="poppins"
            justifyContent={"center"}
          >
            <h4 style={{ marginLeft: "20px" }}>Welcome to ChatVista!👋</h4>
            <h2 style={{ marginLeft: "40px" }}>Click on users to chat</h2>
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
