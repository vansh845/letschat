import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

export default function GroupChat() {
    const groupid = useLoaderData();
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMsg, setInputMsg] = useState("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        var ws = new WebSocket("http://localhost:3000/group/" + groupid)
        ws.onopen = (_) => setSocket(ws)

    }, [])

    useEffect(() => {
        socket?.addEventListener("message", (e) => {
            setMessages((prev) => [...prev, e.data])
        })
    }, [socket])

    function sendMessage() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(inputMsg);
            setInputMsg('');
        }
    }



    return (
        <>
            <Link to='/'>Home</Link>
            <input type="text" className="txt" onChange={e => setInputMsg((e.target as HTMLInputElement).value)} value={inputMsg} />
            <button onClick={sendMessage}  >Send</button>
            <ul className="messages" style={{ listStyleType: "none" }}>
                {messages.map(message => <li>{message}</li>)}
            </ul>
        </>
    )

}