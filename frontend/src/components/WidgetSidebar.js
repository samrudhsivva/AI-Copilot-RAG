import React from "react";
import "./WidgetSidebar.css";

function WidgetSidebar({ widgets, onSelect }) {
  return (
    <div className="widget-sidebar">
      <h3 className="widget-title">📦 Saved Widgets</h3>
      <div className="widget-list">
        {widgets.map((widget, i) => (
          <button
            key={i}
            className="widget-entry"
            title={widget.title}
            onClick={() => onSelect(widget)}
          >
            <span className="widget-icon">📊</span>
            <span className="widget-label">{widget.title.length > 20 ? widget.title.slice(0, 20) + '...' : widget.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WidgetSidebar;
