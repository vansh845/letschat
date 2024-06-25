package ws

import (
	"encoding/json"
	"fmt"

	"github.com/labstack/echo/v4"
	"nhooyr.io/websocket"
)

func newConfig() *websocket.AcceptOptions {
	return &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	}
}

type Message struct {
	Message   string `json:"message"`
	TimeStamp int    `json:"timestamp"`
	Roomid    string `json:"roomid"`
}

var connectionPool map[string][]*websocket.Conn = make(map[string][]*websocket.Conn)

func WebsocketHandler(c echo.Context) error {
	config := newConfig()
	conn, err := websocket.Accept(c.Response(), c.Request(), config)
	if err != nil {
		return err
	}
	defer conn.Close(websocket.CloseStatus(err), "ending connection")

	netConn := websocket.NetConn(c.Request().Context(), conn, 1)
	fmt.Println("Connection established with", netConn.RemoteAddr().String())
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
	if err != nil {
		closeErr := websocket.CloseError{}
		if err == closeErr {
			var tempConnArr []*websocket.Conn
			for _, x := range connectionPool[groupid] {
				if websocket.NetConn(c.Request().Context(), x, websocket.MessageText).RemoteAddr().String() == websocket.NetConn(c.Request().Context(), conn, websocket.MessageText).RemoteAddr().String() {
					continue
				}
				tempConnArr = append(tempConnArr, x)
			}
			connectionPool[groupid] = tempConnArr
		}
		return err
	}
	defer conn.Close(websocket.StatusGoingAway, "going away")

	netConn := websocket.NetConn(c.Request().Context(), conn, 1)
	fmt.Println("Group Connection established ", netConn.RemoteAddr().String())

	connectionPool[groupid] = append(connectionPool[groupid], conn)

	for {
		fmt.Printf("size of room %d\n", len(connectionPool[groupid]))
		msgType, buffer, err := conn.Read(c.Request().Context())
		if err != nil {
			panic(err)
		}

		var message Message
		err = json.Unmarshal(buffer, &message)
		if err != nil {
			panic(err)
		}

		fmt.Println(msgType, c.Request().RemoteAddr, message)
		for _, resConn := range connectionPool[groupid] {
			// if websocket.NetConn(context.Background(), resConn, websocket.MessageText).RemoteAddr().String() != netConn.RemoteAddr().String() {
			resConn.Write(c.Request().Context(), msgType, buffer)
			// }
		}
	}
}
