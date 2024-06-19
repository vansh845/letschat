import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

export default function GroupChat() {
    const groupid = useLoaderData();
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMsg, setInputMsg] = useState("");

    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket("/group/" + groupid)
        }
        socketRef.current.onmessage = (e) => {
            setMessages(prev => [...prev, e.data])
        }
    }, [])


    function sendMessage() {
        if (socketRef && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current?.send(inputMsg);
            setInputMsg('');
        }
    }



    return (
        <>

            <Link to='/'>Home</Link>
            <input type="text" className="txt" onChange={e => setInputMsg((e.target as HTMLInputElement).value)} value={inputMsg} />
            <button onClick={sendMessage} >Send</button>
            <ul className="messages" style={{ listStyleType: "none" }}>
                {messages.map(message => <li>{message}</li>)}
            </ul>

        </>
    )

}