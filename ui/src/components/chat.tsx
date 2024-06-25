/**
 * v0 by Vercel.
 * @see https://v0.dev/t/8gAgXL8gLi7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { MoveHorizontalIcon, PaperclipIcon, SearchIcon, SendIcon } from "./ui/icons";
import { Input } from "./ui/input";
import { useLoaderData, useLocation } from "react-router-dom";

type message = {
    message: string,
    timeStamp: number,
    roomid: string,
    type: "recieved" | "sent"
}

export default function Chat() {
    const { params } = useLoaderData() as { params: string };
    const [data, setData] = useState<message[]>([]);
    const location = useLocation();
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket("http://localhost:3000/chat");
        }
        socketRef.current.onmessage = (e) => {
            const recievedMessage = JSON.parse(e.data) as message
            recievedMessage.type = "recieved"
            console.log("message recieved")
            setData(prev => [...prev, recievedMessage])
        }

    }, [])

    const [messageBox, setMessageBox] = useState("");
    function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
        setMessageBox(e.target.value);
    }

    function sendMessage(e: MouseEvent<HTMLFormElement>) {
        e.preventDefault();
        setData(prev => [...prev, { message: messageBox, roomid: params, timeStamp: Date.now(), type: "sent" }]);
        socketRef.current?.send(JSON.stringify({
            message: messageBox,
            roomid: params,
            timeStamp: Date.now()
        }));
        setMessageBox("");

    }

    return (

        <div className="flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <SearchIcon className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <PaperclipIcon className="h-5 w-5" />
                        <span className="sr-only">Attach</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoveHorizontalIcon className="h-5 w-5" />
                        <span className="sr-only">More</span>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted p-3 text-sm">
                            <p>Hey, did you see the new design?</p>
                            <p className="text-xs text-muted-foreground">2:30 PM</p>
                        </div>
                    </div>
                    <div className="flex justify-end items-start gap-3">
                        <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                            <p>Looks great! I love the new color scheme.</p>
                            <p className="text-xs text-muted-foreground">2:32 PM</p>
                        </div>
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg bg-muted p-3 text-sm">
                            <p>Awesome, let's discuss the details later.</p>
                            <p className="text-xs text-muted-foreground">2:35 PM</p>
                        </div>
                    </div>
                    <div className="flex justify-end items-start gap-3">
                        <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                            <p>Sounds good, I'm free after 4pm.</p>
                            <p className="text-xs text-muted-foreground">2:37 PM</p>
                        </div>
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                    </div>
                    {data.filter(message => message.roomid == params).map((message, i) => message.type == "recieved" ? <ReceivedMessage key={i} message={message.message} /> : <SentMessage key={i} message={message.message} />)}
                </div>
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

function ReceivedMessage({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="rounded-lg bg-muted p-3 text-sm">
                <p>{message}</p>
                <p className="text-xs text-muted-foreground">2:30 PM</p>
            </div>
        </div>
    )
}

function SentMessage({ message }: { message: string }) {
    return (
        <div className="flex justify-end items-start gap-3">
            <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                <p>{message}</p>
                <p className="text-xs text-muted-foreground">2:32 PM</p>
            </div>
            <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AC</AvatarFallback>
            </Avatar>
        </div>
    )
}
