/**
 * v0 by Vercel.
 * @see https://v0.dev/t/8gAgXL8gLi7
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button"
import { Link, Outlet } from "react-router-dom"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PlusIcon } from "./components/ui/icons"

export default function App() {

  return (
    <div className="grid min-h-screen w-full grid-cols-[300px_1fr] ">
      <div className="flex flex-col border-r bg-muted/40 p-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chats</h2>
          <Button variant="ghost" size="icon">
            <PlusIcon className="h-5 w-5" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="mt-4 space-y-2">
            <Link to="chat/123" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
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
            <Link to="chat/234" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
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
            <Link to="chat/345" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted" >
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
      <Outlet />
    </div>

  )
}



