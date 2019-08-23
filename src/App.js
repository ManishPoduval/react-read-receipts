import React from "react";
import { CometChat } from "@cometchat-pro/chat";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import { resolveSoa } from "dns";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      unreadMessages: 0,
      user: {},
      messages: []
    };
  }

  updateUnreadMessages = async () => {
    const res = await CometChat.getUnreadMessageCountForGroup("supergroup");
    console.log('res', res)
    if (res.supergroup > 0) {
      this.setState({
        unreadMessages: res.supergroup
      });
    }
    
  };

  connect = async username => {
    await CometChat.init("679605312a7263");
    return await CometChat.login(
      username,
      "aa84a90eb80dae9d4008643043dad94635e3f852"
    );
  };

  sendMessage = async messageText => {
    let message = new CometChat.TextMessage(
      "supergroup",
      messageText,
      CometChat.MESSAGE_TYPE.TEXT,
      CometChat.RECEIVER_TYPE.GROUP
    );
    message = await CometChat.sendMessage(message);
    this.setState({ messages: [...this.state.messages, message] });
  };

  subscribe = () => {
    CometChat.addMessageListener(
      "UNIQUE_LISTENER_ID",
      new CometChat.MessageListener({
        onTextMessageReceived: async message => {
          console.log("onTextMessageReceived", message);
          this.setState({
            messages: [...this.state.messages, message]
          });
          if (document.hasFocus()) {
            console.log(`marking message ${message.id} as read`);
            CometChat.markMessageAsRead(message);
          }
          await this.updateUnreadMessages()
        },
        onMessageDelivered: receipt => {
          console.log("onMessageDelivered", receipt);
          const x = this.state.messages.map(message => {
            if (message.id === receipt.messageId) {
              return {
                ...message,
                delivered: true
              };
            }
            return message;
          });
          this.setState({ messages: x });
        },
        onMessageRead: receipt => {
          console.log("onMessageRead", receipt);
          const x = this.state.messages.map(message => {
            if (message.id === receipt.messageId) {
              return {
                ...message,
                read: true,
                delivered: true
              };
            }
            return message;
          });
          this.setState({ messages: x });
          this.updateUnreadMessages()
        }
      })
    );
  };

  handleFocus = () => {
    window.addEventListener("focus", () => {
      const updatedMessages = this.state.messages.map(message => {
        if (
          !message.markedAsRead &&
          message.sender.uid !== this.state.user.uid
        ) {
          CometChat.markMessageAsRead(message);
          console.log(`marking message ${message.id} as read`);
          return {
            ...message,
            markedAsRead: true
          };
        }
        return message;
      });
      this.setState({ messages: updatedMessages });
      this.updateUnreadMessages()
    });
  };

  async componentDidMount() {
    const username = prompt("username");
    // const username = "superhero1";
    const user = await this.connect(username);
    this.setState({ loading: false, user });
    this.subscribe();
    this.handleFocus();
    await this.updateUnreadMessages();
  }

  render() {
    if (this.state.loading) {
      return <p>Loading...</p>;
    } else {
      return (
        <div style={{ padding: "10px 30px 10px 30px" }}>
          <h1>Chat</h1>
          <p>
            You have successfully connected to CometChat with the username{" "}
            <strong>
              {this.state.user.name} ({this.state.user.uid})
            </strong>{" "}
            and below are your messages. You have{" "}
            <strong>{this.state.unreadMessages}</strong> unread messages.
          </p>
          <MessageList messages={this.state.messages} />
          <MessageInput onSubmit={this.sendMessage} />
          <button onClick={this.handleClick}>Count</button>
        </div>
      );
    }
  }
}
