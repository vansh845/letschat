export type message = {
    message: string,
    username: string,
    roomname: string,
    type: "recieved" | "sent" | "initial" | "file",
    rooms: string[]
}