import React from "react";
import ChatLoading from "../ChatLoading";
import countries from "./countries";
import { useState, useEffect } from "react";
import { Tooltip } from "@chakra-ui/tooltip";
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { IconButton } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import { Select } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Avatar } from "@chakra-ui/avatar";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import { Spinner } from "@chakra-ui/spinner";
import { getSender } from "../../config/ChatLogics";
import "../style.css";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/toast";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [lang,setLang]=useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [searchResult, setSearchResult] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [messages, setmessages] = useState();
  
  const [loadingChat, setLoadingChat] = useState(false);
  const {
    user,selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleLanguageSelect = (language) => {
    
    const countryCode = Object.keys(countries).find(
      (key) => countries[key] === language
    );
    setSelectedLanguage(countryCode);
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chats`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

 


  const translateMessage = async (text, targetLanguage) => {
    const url = 'https://microsoft-translator-text.p.rapidapi.com/translate';
    const apiKey = 'bf420af9e2msha04cfd0d9a21b27p1f0594jsn2b52bc42f7f2';
  
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
      },
      body: [
        {
          Text: text,
        },
      ],
    };
  
    try {
      const response = await fetch(`${url}?to[0]=${targetLanguage}&api-version=3.0&profanityAction=NoAction&textType=plain`, options);
      const result = await response.json();
      return result[0]?.translations[0]?.text || text;
    } catch (error) {
      console.error(error);
      return text;
    }
  };
  




  return (
    <>
      <Box
        style={{ display: "flex" }}
        justifyContent="space-between"
        alignItems="center"
        bg={"white"}
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users" hasArrow placement="bottom-end">
          <Button variant={"ghost"} onClick={onOpen} style={{border:"0.3px solid grey",boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px"}}>
            <i className="fas fa-search" fontSize={"18px"}></i>
            <Text d={{ base: "none", md: "flex" }} px={4}>
              {" "}
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="3xl" fontFamily="Poppins" color={"indigo"} style={{ fontWeight: "600" }}>
          ChatVista
        </Text>
        <div>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <GTranslateIcon size={"sm"} cursor={"pointer"} />
              {selectedLanguage && (
                <Text ml={2} fontSize="sm">
                  ({selectedLanguage})
                </Text>
              )}
            </MenuButton>
            <MenuList className="lang-list">
              {Object.values(countries).map((country, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                   handleLanguageSelect(country)
                    // translateMessage();
                    setLang(true);
                   
                  }}
          
                >
                  {country}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem> My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}> Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2} style={{ display: "flex" }}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                onClick={handleSearch}
                cursor="pointer"
                bg="#ABDCFF"
                _hover={{
                  background: "#E2B0FF",
                  color: "white",
                }}
              >
                Search
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
