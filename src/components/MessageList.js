import React from "react";
import Message from "./Message"
export default ({ messages }) => {
  return (
    <ul
      style={{
        paddingLeft: 0,
        listStyle: "none"
      }}
    >
      {messages.map(message => (
        <Message message={message} key={message.id} />
      ))}
    </ul>
  );
};
