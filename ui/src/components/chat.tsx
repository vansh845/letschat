import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { MoveHorizontalIcon, PaperclipIcon, SearchIcon, SendIcon } from "./ui/icons";
import { Input } from "./ui/input";
import { useLoaderData } from "react-router-dom";
import { Dialog, DialogContent } from "./ui/dialog";
import FileUpload from "./fileupload";

type message = {
    message: string,
    username: string,
    roomname: string,
    type: "recieved" | "sent" | "initial" | "file",
    rooms: string[]
}


export default function Chat() {
    const { chats, params, userid } = useLoaderData() as { chats: any[] | null, params: string, userid: number };
    const [data, setData] = useState<message[]>([]);
    const [fileUrl, setFileUrl] = useState("");
    const [openFileComp, setOpenFileComp] = useState(false);
    const [user, _] = useState(localStorage.getItem('username')!)
    const [isClosed, setIsClosed] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket("http://localhost:3000/chat");
        }
        socketRef.current.onopen = (_) => {
            console.log("connection established")
            if (localStorage.getItem('rooms') != null) {
                const rooms = JSON.parse(localStorage.getItem('rooms')!) as string[]
                const initialMessage: message = { message: "", username: user, roomname: "", rooms: rooms, type: "initial" }
                socketRef.current?.send(JSON.stringify(initialMessage))
            }
        }
        socketRef.current.onmessage = (e) => {
            const recievedMessage = JSON.parse(e.data) as message
            console.log("message recieved")
            recievedMessage.type = "recieved"
            setData(prev => [...prev, recievedMessage])
        }
        socketRef.current.onclose = (_) => {
            setIsClosed(true);
        }

    }, [])


    const [messageBox, setMessageBox] = useState("");
    function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
        setMessageBox(e.target.value);
    }

    function sendMessage(e: MouseEvent<HTMLFormElement>) {
        e.preventDefault();
        const temp: message = { message: messageBox, username: user, roomname: params, type: "sent", rooms: [] };
        setData(prev => [...prev, temp]);
        socketRef.current?.send(JSON.stringify(temp));
        setMessageBox("");

    }

    async function handleMediaUpload(_: MouseEvent<HTMLButtonElement>) {
        setOpenFileComp(true)
    }

    useEffect(() => {
        if (socketRef.current && socketRef.current.OPEN == 1) {

            const temp: message = { message: fileUrl, username: user, roomname: params, type: "file", rooms: [] };
            setData(prev => [...prev, temp]);
            // socketRef.current?.send(JSON.stringify(temp));
            setMessageBox("");
        }
    }, [fileUrl])

    useEffect(() => {
        console.log(data)
    }, [])

    return (

        <div className="flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>{params[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-medium">{params}</h4>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <SearchIcon className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button onClick={handleMediaUpload} variant="ghost" size="icon">
                        <PaperclipIcon className="h-5 w-5" />
                        <span className="sr-only">Attach</span>
                    </Button>
                    <Dialog open={openFileComp} onOpenChange={setOpenFileComp}>
                        <DialogContent>
                            <FileUpload setUrl={setFileUrl} setOpenFile={setOpenFileComp} />
                        </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon">
                        <MoveHorizontalIcon className="h-5 w-5" />
                        <span className="sr-only">More</span>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <div className="grid gap-4">
                    {chats?.map(chat => chat[1] == userid ? <SentMessage message={chat[0]} /> : <ReceivedMessage message={chat[0]} />)}
                    {data.filter(message => message.roomname == params).map((message, i) => message.type == "recieved" ? <ReceivedMessage key={i} message={message} /> : <SentMessage key={i} message={message} />)}
                </div>
                {isClosed ? <p className="mt-2 text-center text-sm text-muted-foreground">Connection ended, please reload.</p> : ""}
            </div>
            <div className="sticky bottom-0 z-10 border-t bg-background p-4">
                <form onSubmit={sendMessage} className="relative">
                    <Input
                        placeholder="Type your message..."
                        className="min-h-[48px] w-full rounded-2xl border border-neutral-400 pr-16 shadow-sm"
                        value={messageBox}
                        onChange={handleMessageChange}
                    />
                    <Button type="submit" size="icon" className="absolute right-3 top-1">
                        <SendIcon className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}

function ReceivedMessage({ message }: { message: message }) {
    if (message.type == "file") {
        return (
            <div className="flex justify-end items-start gap-3">
                <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                    <img className="w-1/4" src={message.message} alt="file" />
                    <p className="text-xs text-muted-foreground">2:32 PM</p>
                </div>
                <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>AC</AvatarFallback>
                </Avatar>
            </div>
        )
    }
    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="rounded-lg bg-muted p-3 text-sm">
                <p>{message.message}</p>
                <p className="text-xs text-muted-foreground">2:30 PM</p>
            </div>
        </div>
    )
}

function SentMessage({ message }: { message: message }) {
    if (message.type == "file") {
        return (
            <div className="flex justify-end items-start gap-3">
                <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                    <img src={message.message} alt="file" />
                    <p className="text-xs text-muted-foreground">2:32 PM</p>
                </div>
                <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>AC</AvatarFallback>
                </Avatar>
            </div>
        )
    }
    return (
        <div className="flex justify-end items-start gap-3">
            <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                <p>{message.message}</p>
                <p className="text-xs text-muted-foreground">2:32 PM</p>
            </div>
            <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
            </Avatar>
        </div>
    )
}
