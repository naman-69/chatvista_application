import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat.jsx";
import "./App.css";

function App() {
 

  return (
    <div className="App">
    
      <Routes>
      <Route path="/" element={<Home />} exact />
      <Route path="/Chats" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
