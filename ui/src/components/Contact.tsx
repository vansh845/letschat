import { useLoaderData } from "react-router-dom"

export default function Contact() {
    const data = useLoaderData()
    return (
        <>
            Hey i am from contacts, {data}
        </>
    )
}