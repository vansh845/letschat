import { Link, Outlet } from "react-router-dom";

export default function Message() {
    return (
        <>
            <h3>Hey i am from hey next route</h3>
            <Link to="contacts/1">to contacts</Link>
            <Outlet />
        </>
    )
}