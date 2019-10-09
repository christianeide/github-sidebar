import React from "react";
import "./read.scss";

export default class Read extends React.PureComponent {
  render() {
    const { read, toggleRead, title, status } = this.props;
    const titleText = title || (read ? "Mark as read" : "Mark as unread");
    return (
      <div
        className={`readButton ${read ? "read" : "notRead"}`}
        onClick={toggleRead}
        title={titleText}
      >
        <div className={`color ${status}`} />
      </div>
    );
  }
}
