import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = new WebSocket("http://localhost:3000/chat")

    }
    socketRef.current.onmessage = (e) => {
      setMessages(prev => [...prev, e.data])
    }

  }, [])

  useEffect(() => {
    console.log(messages)
  }, [messages])


  function sendMessage() {
    if (socketRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(inputMsg);
      setInputMsg('');
    }
  }



  return (
    <>
      <Link to={`/group-chat/${crypto.randomUUID()}`}>Go to group chat</Link>
      <input type="text" className="txt" onChange={e => setInputMsg((e.target as HTMLInputElement).value)} value={inputMsg} />
      <button onClick={sendMessage}  >Send</button>
      <ul className="messages" style={{ listStyleType: "none" }}>
        {messages.map((message, i) => <li key={i}>{message}</li>)}
      </ul>

    </>
  )
}

export default App
