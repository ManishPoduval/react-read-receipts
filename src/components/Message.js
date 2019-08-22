import React from "react";

export default ({ message }) => {
  return (
    <li
      style={{
        border: "1px black solid",
        padding: 8,
        marginBottom: 10,
        position: "relative"
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: 5,
          fontSize: ".8em"
        }}
      >
        {message.sender.name} ({message.sender.uid})
      </span>{" "}
      <span>{message.text}</span>
      <span
        style={{
          position: "absolute",
          bottom: 0,
          right: 0
        }}
      >
        {message.delivered ? <span>☑️</span> : null}
        {message.read ? <span>☑️</span> : null}
      </span>
    </li>
  );
};
