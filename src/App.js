import React from "react";
import { CometChat } from "@cometchat-pro/chat";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";

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
    } else {
      this.setState({
        unreadMessages: 0
      });
    }
    
  };

  connect = async username => {
    await CometChat.init("67972619bf1227");
    return await CometChat.login(
      username,
      "8f42b4ebadde7d7a91e70269b1ae91c1a4e31022"
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

  fetchOldShit = async () => {
    const messageRequestor = new CometChat.MessagesRequestBuilder()
      .setLimit(0)
      .build();
    const previousMessages = await messageRequestor.fetchPrevious();
    console.log("previousMessages", previousMessages);
    this.setState({
      messages: previousMessages
    })

  }

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
    await this.fetchOldShit();
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
