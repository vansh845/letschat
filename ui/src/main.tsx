import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.tsx'
import Message from './components/Message.tsx';
import './index.css'
import Contact from './components/Contact.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/next",
    element: <Message />,

    children: [
      {
        path: "contacts/:contactid",
        element: <Contact />,
        loader: async function loader({ params }) {
          return params.contactid
        }
      }
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
