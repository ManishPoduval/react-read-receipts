import React, { useState } from "react";

export default ({ onSubmit }) => {
  const [text, updateText] = useState("");

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSubmit(text);
        updateText("");
      }}
    >
      <input
        type="text"
        required
        value={text}
        onChange={event => updateText(event.target.value)}
      />
      <input type="submit" />
    </form>
  );
};