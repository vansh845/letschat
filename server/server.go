package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Message struct {
	UserName string   `json:"username"`
	Message  string   `json:"message"`
	RoomName string   `json:"roomname"`
	Rooms    []string `json:"rooms"`
	Type     string   `json:"type"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var connectionPool map[string][]*websocket.Conn = make(map[string][]*websocket.Conn)

func Start(port string, db *pgxpool.Pool, awsClient *s3.Client) {

	e := echo.New()
	e.Static("/app", "ui/dist")
	e.Static("/assets", "ui/dist/assets")
	e.Use(middleware.CORS())
	e.Use(middleware.Logger())
	e.GET("/", func(c echo.Context) error {
		http.Redirect(c.Response(), c.Request(), "/app", http.StatusPermanentRedirect)
		return nil
	})
	e.GET("/register", handleRegisterUser(db))
	e.GET("/chat", handleChat(db, awsClient))
	e.GET("/ping", handlePing(db))
	e.GET("/getchats", handleGetChats(db))
	e.GET("/getuserid", handleGetUserId(db))

	e.Logger.Fatal(e.Start(port))
}

func handleGetUserId(db *pgxpool.Pool) echo.HandlerFunc {
	return func(c echo.Context) error {
		var userId int
		err := db.QueryRow(context.Background(), "select id from users where username=$1", c.QueryParam("username")).Scan(&userId)
		if err != nil {
			return c.String(500, err.Error())
		}
		return c.String(200, fmt.Sprintf("%d", userId))
	}
}

func handleGetChats(db *pgxpool.Pool) echo.HandlerFunc {
	return func(c echo.Context) error {
		userName := c.QueryParam("username")
		roomName := c.QueryParam("roomname")
		var params []any
		var q string
		if userName != "" {
			params = append(params, userName)
			q = `select m.text, m.sender_id, m.room_id, m.created_at
			from messages m
			join rooms r on r.id = m.room_id 
			join users u on u.id = m.sender_id
			where u.username = $1 
			`
		}
		if roomName != "" {
			params = append(params, roomName)
			q = `select m.text, m.sender_id, m.room_id, m.created_at
			from messages m
			join rooms r on r.id = m.room_id 
			join users u on u.id = m.sender_id
			where r.roomname = $1
			`
		}
		if userName != "" && roomName != "" {
			q = `select m.text, m.sender_id, m.room_id, m.created_at
			from messages m
			join rooms r on r.id = m.room_id 
			join users u on u.id = m.sender_id
			where u.username = $1 
			and r.roomname = $2
			`
		}

		ctx := context.Background()

		rows, err := db.Query(ctx, q, params...)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
		var res []interface{}
		for rows.Next() {
			val, err := rows.Values()
			if err != nil {
				log.Println(err)
			}
			res = append(res, val)
		}
		fmt.Println(res...)
		return c.JSON(200, res)

		// } else {
		// 	return c.String(http.StatusNotFound, "send username and roomname")
		// }
	}
}

func handlePing(db *pgxpool.Pool) echo.HandlerFunc {
	return func(e echo.Context) error {
		var res []interface{}
		rows, err := db.Query(context.Background(), "select m.text from messages m join users u on u.id = m.sender_id where u.username = $1 ", e.QueryParam("username"))
		if err != nil {
			return e.String(500, err.Error())
		}
		for rows.Next() {
			value, err := rows.Values()
			if err != nil {
				panic(err)
			}
			res = append(res, value...)

		}
		return e.String(200, fmt.Sprintf("%v", res))
	}
}

func handleRegisterUser(db *pgxpool.Pool) echo.HandlerFunc {
	return func(c echo.Context) error {
		queryName := c.QueryParam("username")
		_, err := db.Exec(context.Background(), "insert into users(username) values ($1)", queryName)
		if err != nil {
			return c.String(500, fmt.Sprintf("something went wrong, %s", err.Error()))
		}
		return c.String(200, "user registered")
	}
}

func handleChat(db *pgxpool.Pool, awsClient *s3.Client) echo.HandlerFunc {
	return func(c echo.Context) error {
		conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
		if err != nil {
			log.Println(err)
			return nil
		}
		defer conn.Close()

		var clientMessage Message
		fmt.Println(conn.RemoteAddr().String())
		// read message loop
		for {

			err = conn.ReadJSON(&clientMessage)
			if err != nil {
				log.Println(err)
				return nil
			}
			fmt.Println(clientMessage)
			userName := clientMessage.UserName
			var userId int
			var roomId int
			if clientMessage.Type == "initial" {
				ctx := context.Background()
				txn, err := db.Begin(ctx)
				if err != nil {
					log.Println(err)
				}
				txn.QueryRow(ctx, "select id from users where username = $1", userName).Scan(&userId)
				for _, room := range clientMessage.Rooms {
					connectionPool[room] = append(connectionPool[room], conn)
					txn.QueryRow(ctx, "insert into rooms(roomname) values($1) returning id", room).Scan(&roomId)
					txn.Exec(ctx, "insert into user_room values($1,$2)", userId, roomId)
				}
				err = txn.Commit(ctx)
				if err != nil {
					log.Println(err)
				}

			} else if clientMessage.Type == "image" {
				ctx := context.Background()
				_, err := awsClient.PutObject(ctx, &s3.PutObjectInput{
					Bucket: aws.String(os.Getenv("odinxletschatmultimedia")),
				})
				if err != nil {
					log.Println(err.Error())
				}

			} else {

				newMessage := clientMessage
				newMessage.Rooms = nil
				newMessage.Type = "default"
				ctx := context.Background()
				txn, err := db.Begin(ctx)
				if err != nil {
					log.Println(err)
				}
				txn.QueryRow(ctx, "select id from users where username=$1", clientMessage.UserName).Scan(&userId)
				txn.QueryRow(ctx, "select id from rooms where roomname=$1", clientMessage.RoomName).Scan(&roomId)
				txn.Exec(ctx, "insert into messages(text,sender_id,room_id) values($1,$2,$3)", clientMessage.Message, userId, roomId)
				txn.Commit(ctx)
				for _, x := range connectionPool[clientMessage.RoomName] {
					if x.RemoteAddr() != conn.RemoteAddr() {
						x.WriteJSON(newMessage)
					}
				}
			}
		}
	}

}
