import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.tsx';
import GroupChat from './components/Groupchat.tsx';
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {

    path: "/group-chat/:groupid",
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
