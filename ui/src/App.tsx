/**
 * v0 by Vercel.
 * @see https://v0.dev/t/8gAgXL8gLi7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button"
import { Link, Outlet, useLoaderData } from "react-router-dom"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PlusIcon } from "./components/ui/icons"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"
import { ChangeEvent, MouseEvent, useState } from "react"
import { uuidv4 } from "./lib/utils"

export default function App() {

  const data = useLoaderData() as { rooms: string[], userName: boolean, userId: number };
  const [openUserDialog, setOpenUserDialog] = useState(!data.userName);
  const [userName, setHandleUserName] = useState("");
  function handleChangeUserName(e: ChangeEvent<HTMLInputElement>) {
    setHandleUserName(e.target.value)
  }

  async function handleSaveUser(_: MouseEvent<HTMLButtonElement>) {
    const res = await fetch(`/api/register?username=${userName}`, { method: "GET" })
    const b = await res.text()
    console.log(b)
    if (b == "user registered") {
      setOpenUserDialog(false)
      localStorage.setItem("username", userName);
      setHandleUserName("")
    }
  }

  if (data == null || data.rooms.length == 0) {
    return (
      <div className="grid min-h-screen w-full grid-cols-[300px_1fr] ">
        <div className="flex flex-col border-r bg-muted/40 p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chats</h2>
            <JoinGroup />

            <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog} defaultOpen={true}>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Choose a nickname</DialogTitle>

                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Username
                    </Label>
                    <Input id="username" value={userName} onChange={handleChangeUserName} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose>
                    <Button>Close</Button>
                  </DialogClose>
                  <Button onClick={handleSaveUser}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
          <div className="flex-1 overflow-auto">
            <div className="mt-4 space-y-2">
              Looks lonely here, create or join someone.
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    )
  }
  return (
    <div className="grid min-h-screen w-full grid-cols-[300px_1fr] ">
      <div className="flex flex-col border-r bg-muted/40 p-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chats</h2>
          <JoinGroup />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="mt-4 space-y-2">
            {data.rooms.map((x, i) => (
              <Link key={i} to={`chat/${x}`} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>{x[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium truncate">{x}</h4>
                  {/* <p className="text-sm text-muted-foreground truncate">Sounds good, let's discuss it.</p> */}
                </div>
                <div className="text-xs text-muted-foreground">1d</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Outlet />
    </div>

  )
}

function JoinGroup() {

  const [roomId, setRoomId] = useState(uuidv4());

  function handleRoomInput(e: ChangeEvent<HTMLInputElement>) {
    setRoomId(e.target.value)
  }

  function handleJoinRoom(_: MouseEvent<HTMLButtonElement>) {

    const rooms = localStorage.getItem("rooms")
    if (rooms == null) {
      localStorage.setItem("rooms", JSON.stringify([roomId]))
    } else {
      const temp = JSON.parse(rooms) as string[]
      temp.push(roomId)
      localStorage.setItem("rooms", JSON.stringify(temp))
    }
    window.location.reload();

  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusIcon className="h-5 w-5" />
          <span className="sr-only">New Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create or Join Group</DialogTitle>
          <DialogDescription>
            Enter room id
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Room ID
            </Label>
            <Input id="roomId" value={roomId} onChange={handleRoomInput} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button onClick={handleJoinRoom} type="submit">Join</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}