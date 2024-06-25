package server

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/vansh845/letschat/server/ws"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Start(port string) {

	e := echo.New()
	e.Static("/app", "ui/dist")
	e.Static("/assets", "ui/dist/assets")

	// logger := func(next echo.HandlerFunc) echo.HandlerFunc {
	// 	return func(c echo.Context) error {
	// 		fmt.Println("remote addr", c.Request().RemoteAddr)
	// 		return next(c)
	// 	}
	// }

	e.GET("/chat", handleMessages)
	e.GET("/group/:groupid", ws.GroupChatHandler)
	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "PONG")
	})

	e.Logger.Fatal(e.Start(port))
}

var connectionPool map[string][]*websocket.Conn = make(map[string][]*websocket.Conn)

func handleMessages(c echo.Context) error {
	conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Println(err)
		return nil
	}
	defer conn.Close()

	var message ws.Message
	fmt.Println(conn.RemoteAddr().String())
	for {

		err = conn.ReadJSON(&message)
		if err != nil {
			log.Println(err)
			return nil
		}
		fmt.Println(message)
		roomId := message.Roomid
		if message.Type == "initial" {
			for _, room := range message.Rooms {
				connectionPool[room] = append(connectionPool[room], conn)
			}
		} else {

			newMessage := ws.Message{Message: message.Message, TimeStamp: int(time.Now().UnixMilli()), Roomid: roomId, Rooms: []string{}, Type: "sent"}
			for _, x := range connectionPool[roomId] {
				if x.RemoteAddr() != conn.RemoteAddr() {
					x.WriteJSON(newMessage)
				}
			}
		}
	}
}
