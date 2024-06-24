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
import Component from './components/v0.tsx';


const router = createBrowserRouter([
  {
    path: "/app",
    element: <Component />
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
