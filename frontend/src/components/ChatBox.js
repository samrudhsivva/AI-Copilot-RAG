import React, { useState } from "react";
import axios from "../api";
import Visualizer from "./Visualizer";
import FeedbackButtons from "./FeedbackButtons";
import WidgetSidebar from "./WidgetSidebar"; // ✅ New component
import "./ChatBox.css";

function ChatBox() {
  const [prompt, setPrompt] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [response, setResponse] = useState(null);
  const [endpoint, setEndpoint] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [isWidgetView, setIsWidgetView] = useState(false);
const [savedPrompt, setSavedPrompt] = useState("");
const [savedResponse, setSavedResponse] = useState("");


  const [chatHistory, setChatHistory] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [activeWidget, setActiveWidget] = useState(null);
  

  // 🧠 Gemini text response
  const handlePromptSubmit = async () => {
    const form = new FormData();
    form.append("prompt", prompt);
  
    const res = await axios.post("/agent/", form);
    setChatResponse(res.data.response);
    setChatHistory((prev) => [
      ...prev,
      { prompt, response: res.data.response, agent: res.data.agent },
    ]);
    setShowChart(false);
  };
  const formatResponse = (text) => {
    if (!text) return "";
  
    // Escape any HTML tags to prevent XSS
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
    // Handle bold (**text**)
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
    // Handle headers (#, ##, ###)
    safeText = safeText
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>");
  
    // Handle numbered lists
    safeText = safeText.replace(/\d+\.\s(.*?)(<br\/>|$)/g, "<li>$1</li>");
    if (safeText.includes("<li>")) {
      safeText = `<ol>${safeText}</ol>`;
    }
  
    // Handle bullet lists (- text)
    safeText = safeText.replace(/- (.*?)(<br\/>|$)/g, "<li>$1</li>");
    if (safeText.includes("<li>")) {
      safeText = `<ul>${safeText}</ul>`;
    }
  
    // Handle line breaks
    safeText = safeText.replace(/\n/g, "<br/>");
  
    return safeText;
  };
  

  // 📊 Gemini structured chart JSON
  const generateChart = async () => {
    const form = new FormData();
    form.append("prompt", prompt);
  
    try {
      const res = await axios.post("/gemini/visualize/", form);
      console.log("Gemini Visualize Response:", res.data);
  
      const chartData = res.data.data;
  
      if (Array.isArray(chartData) && chartData.length > 0) {
        setResponse(chartData);
        setEndpoint(res.data.endpoint);
        setShowChart(true);
      } else {
        alert("Gemini was unable to create a chart for this prompt.\nTry a data-related prompt.");
      }
    } catch (error) {
      console.error("Chart generation error:", error);
      alert("Something went wrong: " + error.message);
    }
  };
  
  

  // ➕ Save visual as a widget
  const saveWidget = async () => {
    const form = new FormData();
    form.append("title", prompt);
    form.append("data", JSON.stringify(response));
    form.append("endpoint", endpoint);

    const res = await axios.post("/save_widget/", form);
    setWidgets((prev) => [
      ...prev,
      {
        id: res.data.id,
        title: prompt,
        data: response,
        endpoint: endpoint,
      },
    ]);
  };

  // 🖱️ Restore chart from a widget
  const handleWidgetClick = (widget) => {
    // Save current chat state before switching
    setSavedPrompt(prompt);
    setSavedResponse(chatResponse);
  
    // Show only widget
    setActiveWidget(widget);
    setPrompt(widget.title);
    setResponse(widget.data);
    setEndpoint(widget.endpoint);
    setShowChart(true);
    setChatResponse(""); // hide Gemini text
    setIsWidgetView(true);
  };
  

  return (
    <div className="main-layout">
      {/* 📦 Widget Sidebar on Left */}
      <WidgetSidebar widgets={widgets} onSelect={handleWidgetClick} />
  
      {/* 💬 Chat + Chart Panel (Middle) */}
      <div className="chatbox-container">
        <h1 className="chat-title">🤖 Copilot Chat</h1>
  
        <div className="chat-ui">
          <input
            className="chatbox-input"
            type="text"
            placeholder="Ask your Copilot..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="button-row">
            <button onClick={handlePromptSubmit}>Ask Copilot</button>
          </div>
        </div>
        {isWidgetView && (
  <button
    className="back-to-chat-button"
    onClick={() => {
      setPrompt(savedPrompt);
      setChatResponse(savedResponse);
      setActiveWidget(null);
      setIsWidgetView(false);
    }}
  >
    ← Back to Chat
  </button>
)}

  
        {/* 🧠 Gemini Chat Response */}
        <div className="chat-conversation">
  {/* Display user prompt as chat bubble */}
  {prompt && (
    <div className="chat-bubble user">{prompt}</div>
  )}

  {/* Show AI typing animation */}
  {!chatResponse && (
    <div className="chat-bubble ai typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  )}

  {/* Final AI response */}
  {chatResponse && (
    <>
      <div className="chat-bubble ai">
        <div
          className="formatted-response"
          dangerouslySetInnerHTML={{ __html: formatResponse(chatResponse) }}
        />
        <p><strong>Agent:</strong> {chatHistory[chatHistory.length - 1]?.agent || "WebUI"}</p>
      </div>
      <button onClick={generateChart} className="icon-button">
        📊 Visualize
      </button>
    </>
  )}
</div>



  
        {/* 📈 Visualization + ➕ Save */}
        {showChart && response && (
          <div className="chart-area">
            <Visualizer
  data={response}
  chartType={
    response[0]?.label
      ? "pie"
      : response[0]?.year
      ? "line"
      : "table"
  }
  title={prompt}
/>

            <div className="api-endpoint"><strong>API:</strong> {endpoint}</div>
            <a href={endpoint} target="_blank" rel="noreferrer">{endpoint}</a>
            <button className="add-widget-button" onClick={saveWidget}>
              ➕ Save to Widgets
            </button>
          </div>
        )}

        
  
        <FeedbackButtons />
      </div>
  
      {/* 📜 Right Panel: Chat History */}
      <div className="right-history-panel">
        <h3>🗃️ Chat History</h3>
        {chatHistory.map((chat, i) => (
          <div key={i} className="chat-block">
            <p><strong>Prompt:</strong> {chat.prompt}</p>
            <p><strong>Response:</strong> {chat.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
  
}

export default ChatBox;
