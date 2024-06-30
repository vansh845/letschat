import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { FileIcon, MoveHorizontalIcon, PaperclipIcon, SearchIcon, SendIcon } from "./ui/icons";
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLoaderData } from "react-router-dom";
import { Dialog, DialogContent } from "./ui/dialog";
import { message } from '@/lib/types'

export default function Chat() {
    const { chats, params, userid } = useLoaderData() as { chats: any[] | null, params: string, userid: number };
    const [data, setData] = useState<message[]>([]);
    const [openFileComp, setOpenFileComp] = useState(false);
    const [user, _] = useState(localStorage.getItem('username')!)
    const [isClosed, setIsClosed] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);
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
    function scrollToBottom() {
        messageEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }

    async function handleMediaUpload(_: MouseEvent<HTMLButtonElement>) {
        setOpenFileComp(true)
    }

    useEffect(() => {
        scrollToBottom()
    }, [data])

    const [file, setFile] = useState<File | null>(null);
    const [wait, setWait] = useState(true);

    async function uploadFile(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        var res
        if (file) {
            const formdata = new FormData();
            formdata.append("filename", file.name)
            formdata.append("file", file)
            res = await fetch("http://localhost:3000/uploadmedia", {
                method: "post",
                body: formdata,
            })
        }
        if (res?.status == 200) {
            const url = await res?.text()
            setOpenFileComp(false)
            const temp: message = {
                message: url,
                roomname: params,
                rooms: [],
                type: 'file',
                username: user
            }
            setData(prev => [...prev, temp])
            socketRef.current?.send(JSON.stringify(temp))
        }
    }
    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files?.length > 0) {
            setFile(e.target.files[0])
            setWait(false)
        }
    }

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
                    {/* file upload */}
                    <Dialog open={openFileComp} onOpenChange={setOpenFileComp}>
                        <DialogContent>
                            <Card>
                                <form onSubmit={uploadFile}>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center">
                                            <FileIcon className="w-12 h-12" />
                                            <span className="text-sm font-medium text-gray-500">Drag and drop a file or click to browse</span>
                                            <span className="text-xs text-gray-500">PDF, image, video, or audio</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <Label htmlFor="file" className="text-sm font-medium">
                                                File
                                            </Label>
                                            <Input id="file" type="file" placeholder="File" onChange={handleFile} accept="image/*" />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" size="lg" disabled={wait} className={wait ? `bg-muted-foreground` : ''}>Upload</Button>
                                    </CardFooter>
                                </form>
                            </Card>
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
                    {/* chats from database */}
                    {chats?.map(chat => chat[1] == userid ? <SentMessage message={chat[0]} type={chat[4]} /> : <ReceivedMessage message={chat[0]} type={chat[4]} />)}
                    {/* chats in memory */}
                    {data.filter(message => message.roomname == params).map((message, i) => message.username != user ? <ReceivedMessage key={i} message={message.message} type={message.type} /> : <SentMessage key={i} message={message.message} type={message.type} />)}
                </div>
                {isClosed ? <p className="mt-2 text-center text-sm text-muted-foreground">Connection ended, please reload.</p> : ""}
                <div ref={messageEndRef}></div>
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

function ReceivedMessage({ message, type }: { message: string, type: string }) {
    console.log(type)
    if (type == "file") {
        return (
            <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3 text-sm w-80">
                    <img src={message} />
                    <p className="text-xs text-muted-foreground">2:30 PM</p>
                </div>
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
                <p>{message}</p>
                <p className="text-xs text-muted-foreground">2:30 PM</p>
            </div>
        </div>
    )
}

function SentMessage({ message, type }: { message: string, type: string }) {
    if (type == "file") {
        return (
            <div className="flex justify-end items-start gap-3 ">
                <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground w-80">
                    <img src={message} alt="file" />
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
