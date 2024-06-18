package ws

import (
	"fmt"

	"github.com/labstack/echo/v4"
	"nhooyr.io/websocket"
)

func newConfig() *websocket.AcceptOptions {
	return &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	}
}

var connectionPool map[string][]*websocket.Conn = make(map[string][]*websocket.Conn)

func WebsocketHandler(c echo.Context) error {
	config := newConfig()
	conn, err := websocket.Accept(c.Response(), c.Request(), config)
	defer conn.Close(websocket.CloseStatus(err), "ending connection")
	if err != nil {
		return err
	}

	for {
		msgType, buffer, err := conn.Read(c.Request().Context())
		if err != nil {
			panic(err)
		}
		resp := string(buffer)
		fmt.Println(msgType, c.Request().RemoteAddr, resp)

		conn.Write(c.Request().Context(), msgType, []byte(fmt.Sprintf("echoing... %s", resp)))
	}

}

func GroupChatHandler(c echo.Context) error {
	groupid := c.Param("groupid")
	config := newConfig()
	conn, err := websocket.Accept(c.Response(), c.Request(), config)
	defer conn.Close(websocket.CloseStatus(err), "ending connection")
	if err != nil {
		return err
	}

	connectionPool[groupid] = append(connectionPool[groupid], conn)

	for {
		msgType, buffer, err := conn.Read(c.Request().Context())
		if err != nil {
			panic(err)
		}
		resp := string(buffer)
		fmt.Println(msgType, c.Request().RemoteAddr, resp)
		for _, resConn := range connectionPool[groupid] {

			resConn.Write(c.Request().Context(), msgType, []byte(fmt.Sprintf("echoing... %s", resp)))
		}
	}
}
