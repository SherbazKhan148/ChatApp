import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../components/Loader";
import { createMessage, listMessages } from "../actions/messageActions";
import { v4 } from "uuid";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let socket;
const ChatScreen = ({ history }) => {
    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin;

    const ref = useRef(null);

    const dispatch = useDispatch();

    const messageList = useSelector((state) => state.messageList);
    const { messages: allMessages, loading, success } = messageList;

    const [messages, setmessages] = useState([]);
    const [message, setmessage] = useState("");

    // For Connection to BackEnd
    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        } else {
            socket = io.connect("http://localhost:5000");

            dispatch(listMessages());

            // Sending Value to BackEnd
            socket.emit("join", userInfo, (res) => {
                //Getting Error (if any occurs) from BackEnd
                if (res) alert("Error From Server on 'join' emit" + res);
            });
        }

        return () => {
            // Sending Value to BackEnd
            socket.emit("disconnect", () => {
                //Sending Value To BackEnd
                socket.emit("message-from-client", { userInfo }, () =>
                    console.log("Logout")
                );
            });
            socket.off();
        };

        //eslint-disable-next-line
    }, [userInfo, history]);

    // Will Run Only Once On Page Load => Getting All Messages From Database and putting in Chat
    useEffect(() => {
        if (allMessages && allMessages.length > 0) {
            setmessages([...allMessages, ...messages]);
            if (ref) {
                if (ref.current) {
                    ref?.current?.addEventListener(
                        "DOMNodeInserted",
                        (event) => {
                            // Only this will run everytime when a new message arrives
                            const { currentTarget: target } = event;
                            target.scroll({
                                top: target.scrollHeight,
                            });
                        }
                    );
                }
            }
        }

        return () => {
            // Sending Value to BackEnd
            socket.emit("disconnect", () => {
                //Sending Value To BackEnd
                socket.emit("message-from-client", { userInfo }, () =>
                    console.log("Logout")
                );
            });
            socket.off();
        };
        //eslint-disable-next-line
    }, [allMessages]);

    // Inserting Message in Database and Sending Message to BackEnd
    const sendMessage = (e) => {
        e.preventDefault();

        if (message) {
            dispatch(createMessage({ msg: message }));

            //Sending Value To BackEnd
            socket.emit("message-from-client", { userInfo, message }, () =>
                setmessage("")
            );
        }
    };

    // For Getting Value From BackEnd and Update the Chat
    useEffect(() => {
        if (socket) {
            socket.on("message", ({ user, text }) => {
                setmessages([
                    ...messages,
                    {
                        _id: v4(),
                        user: user._id,
                        msg: `[${user.name}]: ${text}`,
                    },
                ]);
            });
        }

        return () => {
            // Sending Value to BackEnd
            socket.emit("disconnect", () => {
                //Sending Value To BackEnd
                socket.emit("message-from-client", { userInfo }, () =>
                    console.log("Logout")
                );
            });
            socket.off();
        };
        //eslint-disable-next-line
    }, [messages]);

    return (
        <div>
            <ToastContainer />
            <h1>{userInfo?.name}</h1>
            <div>Chat</div>
            <input
                type="text"
                className="input p-2"
                placeholder="Type..."
                name="message"
                id="message"
                value={message}
                onChange={(e) => setmessage(e.target.value)}
                onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
            />
            {/* <button
                className="btn btn-primary btn-sm mb-1"
                onClick={(e) => sendMessage}
            >
                Send
            </button> */}

            <br />
            <hr />
            {userInfo && (
                <>
                    {loading && <Loader />}
                    {success && (
                        <div className="chatDiv" ref={ref}>
                            {messages.map((m) => (
                                <div className="row p-2" key={m._id} id={m._id}>
                                    {m.msg.includes("[admin]") ? (
                                        <div className="offset-2 col-8 admin">
                                            <b>{m.msg}</b>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className={`col-6 ${
                                                    userInfo._id !== m.user &&
                                                    "other"
                                                }`}
                                            >
                                                {userInfo._id !== m.user &&
                                                    m.msg}
                                            </div>
                                            <div
                                                className={`col-6  ${
                                                    userInfo._id === m.user &&
                                                    "myMsgs"
                                                }`}
                                            >
                                                {userInfo._id === m.user &&
                                                    (m.msg.includes(
                                                        userInfo.name
                                                    )
                                                        ? m.msg.replace(
                                                              userInfo.name,
                                                              "Me"
                                                          )
                                                        : "s")}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatScreen;
