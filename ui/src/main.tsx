import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import App from './App.tsx';
import GroupChat from './components/Groupchat.tsx';
import './index.css'
import Chat from './components/chat.tsx';


const router = createBrowserRouter([
  {
    path: "/app",
    element: <App />,
    loader: async function () {
      const res: { rooms: string[], userName: boolean, userId: number } = { rooms: [], userName: false, userId: -1 }
      if (localStorage.getItem("rooms")) {
        const rooms = JSON.parse(localStorage.getItem("rooms")!)
        res.rooms = rooms
      }
      if (localStorage.getItem("username")) {
        res.userName = true
        const temp = await fetch(`http://localhost:3000/api/getuserid?username=${localStorage.getItem("username")}`);
        if (temp.status == 200) {
          const userid = await temp.text()
          res.userId = Number(userid)
          localStorage.setItem("userid", userid)
        }
      }

      return res
    },
    children: [
      {
        path: "chat/:id",
        element: <Chat />,
        loader: async function ({ params }) {
          const res = await fetch(`http://localhost:3000/api/getchats?roomname=${params.id}`)
          const data = await res.json()
          var userid: string
          var temp: { chats: any[], params: string, userid: number } = { chats: data, params: params.id!, userid: -1 }
          if (localStorage.getItem('userid')) {
            userid = localStorage.getItem('userid')!
            temp.userid = Number(userid)

          }
          console.log(data)
          return temp;
        }
      }
    ]
  },
  {
    path: "/",
    loader: async function loader() {
      return redirect("/app")
    }
  },
  {
    path: "/static",
    element: <App />,
  },
  {
    path: "/static/group-chat/:groupid",
    element: <GroupChat />,
    loader: async function loader({ params }) {
      return params.groupid
    }
  }


])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
