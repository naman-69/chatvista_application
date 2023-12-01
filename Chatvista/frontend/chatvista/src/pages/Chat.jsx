import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import Chatbox from "../components/ChatBox.jsx";
import MyChats from "../components/MyChat.jsx";
import SideDrawer from "../components/miscellaneous/SideDrawer.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";
import "../index.css"

const Chat = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{ width: "100%" }} className="chat-page">
      { user && <SideDrawer />}
      <Box style={{display:'flex'}} justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        { user && <MyChats fetchAgain={fetchAgain} />}
      { user &&
        <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
      }
      </Box>
    </div>
  );
};

export default Chat;
