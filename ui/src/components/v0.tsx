/**
 * v0 by Vercel.
 * @see https://v0.dev/t/8gAgXL8gLi7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"

export default function Component() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        const ws = new WebSocket("http://localhost:3000/group/123");
        if (!socket) {
            setSocket(ws);
        }
        socket?.addEventListener("message", (e) => {
            console.log("message recieved")
            setMessages(prev => [...prev, <ReceivedMessage message={e.data} />])
        })
    }, [])

    useEffect(() => {

    }, [socket])

    const [messageBox, setMessageBox] = useState("");
    const [messages, setMessages] = useState<JSX.Element[]>([]);
    function handleMessageChange(e: ChangeEvent<HTMLTextAreaElement>) {
        setMessageBox(e.target.value);
    }

    function sendMessage(e: MouseEvent<HTMLButtonElement>) {
        setMessages(prev => [...prev, <SentMessage message={messageBox} />])
        socket?.send(messageBox);
        setMessageBox("");

    }

    return (
        <div className="grid min-h-screen w-full grid-cols-[300px_1fr]">
            <div className="flex flex-col border-r bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Chats</h2>
                    <Button variant="ghost" size="icon">
                        <PlusIcon className="h-5 w-5" />
                        <span className="sr-only">New Chat</span>
                    </Button>
                </div>
                <div className="flex-1 overflow-auto">
                    <div className="mt-4 space-y-2">
                        <Link to="#" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>AC</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-medium truncate">Acme Inc</h4>
                                <p className="text-sm text-muted-foreground truncate">Hey, did you see the new design?</p>
                            </div>
                            <div className="text-xs text-muted-foreground">2h</div>
                        </Link>
                        <Link to="#" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-medium truncate">John Doe</h4>
                                <p className="text-sm text-muted-foreground truncate">Sounds good, let's discuss it.</p>
                            </div>
                            <div className="text-xs text-muted-foreground">1d</div>
                        </Link>
                        <Link to="#" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted" >
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>SA</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-medium truncate">Sarah Anderson</h4>
                                <p className="text-sm text-muted-foreground truncate">I'm running late, sorry!</p>
                            </div>
                            <div className="text-xs text-muted-foreground">3d</div>
                        </Link>
                    </div>
                </div>
            </div>
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
                        {messages}

                    </div>
                </div>
                <div className="sticky bottom-0 z-10 border-t bg-background p-4">
                    <div className="relative">
                        <Textarea
                            placeholder="Type your message..."
                            className="min-h-[48px] w-full rounded-2xl border border-neutral-400 pr-16 shadow-sm"
                            value={messageBox}
                            onChange={handleMessageChange}
                        />
                        <Button onClick={sendMessage} type="submit" size="icon" className="absolute right-3 top-3">
                            <SendIcon className="h-5 w-5" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
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

function MoveHorizontalIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="18 8 22 12 18 16" />
            <polyline points="6 8 2 12 6 16" />
            <line x1="2" x2="22" y1="12" y2="12" />
        </svg>
    )
}


function PaperclipIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
    )
}


function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}


function SearchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}


function SendIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}