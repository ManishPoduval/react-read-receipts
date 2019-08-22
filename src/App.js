import React, { useEffect, useState } from "react";
import { CometChat } from "@cometchat-pro/chat";
import MessageList from "./components/MessageList"
import MessageInput from "./components/MessageInput"


const App = () => {
  const [messages, updateMessages] = useState([]);
  const [loading, updateLoading] = useState(true);
  const [user, updateUser] = useState(null);

  const connect = async username => {
    await CometChat.init("6752b14a74d822");
    return await CometChat.login(
      username,
      "331f22602b91492963c24f6c1eeefbbc8f3b7fd5"
    );
  };

  const sendMessage = async messageText => {
    let message = new CometChat.TextMessage(
      "supergroup",
      messageText,
      CometChat.MESSAGE_TYPE.TEXT,
      CometChat.RECEIVER_TYPE.GROUP
    );
    message = await CometChat.sendMessage(message);
    updateMessages([...messages, message]);
  };

  useEffect(() => {
    const handleFocus = () => {
      messages.forEach(message => {
        if (message.sender.uid !== user.uid) {
          CometChat.markMessageAsRead(message);
          console.log(`marking message ${message.id} as read`)
        }
      });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [messages, user]);

  useEffect(() => {
    CometChat.addMessageListener(
      "UNIQUE_LISTENER_ID",
      new CometChat.MessageListener({
        onTextMessageReceived: message => {
          console.log("onTextMessageReceived", message)
          updateMessages(messages => [...messages, message]);
          if (document.hasFocus()) {
            console.log(`marking message ${message.id} as read`)
            CometChat.markMessageAsRead(message);
          }
        },
        onMessageDelivered: receipt => {
          console.log("onMessageDelivered", receipt)
          const updatedMessages = messages.map(message => {
            if (message.id === receipt.messageId) {
              message.delivered = true;
            }
            return message;
          });
          updateMessages(updatedMessages);
        },
        onMessageRead: receipt => {
          console.log("onMessageRead", receipt)
          const updatedMessages = messages.map(message => {
            if (message.id === receipt.messageId) {
              message.delivered = true;
              message.read = true;
            }
            return message;
          });
          updateMessages(updatedMessages);
        }
      })
    );
  }, [messages]);

  useEffect(() => {
    (async () => {
      const username = prompt("username");
      // const username = "superhero1";
      const user = await connect(username);
      updateUser(user);

      const messageRequestor = new CometChat.MessagesRequestBuilder()
        .setLimit(5)
        .build();

      const previousMessages = await messageRequestor.fetchPrevious();
      // updateMessages(previousMessages);
      updateLoading(false);
    })();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div style={{ padding: "10px 30px 10px 30px" }}>
        <h1>Chat</h1>
        <p>
          You have successfully connected to CometChat with the username{" "}
          <strong>
            {user.name} ({user.uid})
          </strong>{" "}
          and here are your messages:
        </p>
        <MessageList messages={messages} />
        <MessageInput onSubmit={sendMessage} />
      </div>
    );
  }
};

export default App;
