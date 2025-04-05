import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import WidgetSidebar from "./components/WidgetSidebar";
import "./App.css";
// App.js
import './chartSetup'; // 👈 This ensures chart.js components are globally registered

function App() {
  const [savedWidgets, setSavedWidgets] = useState([]);

  return (
    <div className="app-container">
      <div className="main-content">
        <ChatBox onSaveWidget={(widget) => {
          setSavedWidgets(prev => [...prev, widget]);
        }} />
      </div>
    </div>
  );
}

export default App;
