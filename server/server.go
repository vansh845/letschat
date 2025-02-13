package server

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type errWriter struct {
	w   io.Writer
	err error
}

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
	e.Use(middleware.CORS())

	//websocket connection
	e.GET("/chat", handleChat(db))

	//api
	grp := e.Group("/api")

	grp.GET("/register", handleRegisterUser(db))
	grp.GET("/ping", handlePing(db))
	grp.GET("/getchats", handleGetChats(db))
	grp.GET("/getuserid", handleGetUserId(db))
	grp.POST("/uploadmedia", handleUploadMedia(awsClient))
	fmt.Println("started server")
	e.Logger.Fatal(e.Start("0.0.0.0:3000"))

}

func handleUploadMedia(awsClient *s3.Client) echo.HandlerFunc {
	return func(c echo.Context) error {

		// file, err := os.Create("temp.png")
		// if err != nil {
		// 	fmt.Println(err.Error())
		// }

		// r := bufio.NewReader(fd)
		// w := bufio.NewWriter(file)
		// var buff []byte = make([]byte, 2048)
		// for {
		// 	n, err := r.Read(buff)
		// 	if err != nil {
		// 		if err == io.EOF {
		// 			break
		// 		}
		// 		fmt.Println(err.Error())
		// 	}

		// 	_, err = w.Write(buff[:n])
		// 	if err != nil {
		// 		break
		// 	}

		// }
		// w.Flush()
		fileHeader, err := c.FormFile("file")
		if err != nil {
			fmt.Println(err)
			c.String(http.StatusNoContent, fmt.Sprintf("send file, %s", err.Error()))
		}
		fd, err := fileHeader.Open()
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
		}
		ct := c.Request().Header.Get("Content-Type")
		if strings.HasPrefix(ct, "multipart/form-data") {
			objectKey := c.FormValue("filename")
			_, err := awsClient.PutObject(context.Background(), &s3.PutObjectInput{
				Bucket: aws.String("odinxletschatmultimedia"),
				Body:   fd,
				Key:    aws.String(objectKey),
			})
			if err != nil {
				fmt.Println(err.Error())
				return c.String(500, fmt.Sprintf("something went wrong, %s", err.Error()))
			}
			publicURL := fmt.Sprintf("https://odinxletschatmultimedia.s3.ap-south-1.amazonaws.com/%s", objectKey)

			return c.String(200, publicURL)

		}
		return c.String(500, "something went wrong")

	}
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
			q = `select m.text, m.sender_id, m.room_id, m.created_at, m.message_type
			from messages m
			join users u on u.id = m.sender_id
			where u.username = $1 
			`
		}
		if roomName != "" {
			params = append(params, roomName)
			q = `select m.text, m.sender_id, m.room_id, m.created_at, m.message_type
			from messages m
			join rooms r on r.id = m.room_id 
			where r.roomname = $1
			`
		}
		if userName != "" && roomName != "" {
			q = `select m.text, m.sender_id, m.room_id, m.created_at, m.message_type
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
		fmt.Println(res)
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

func handleChat(db *pgxpool.Pool) echo.HandlerFunc {
	return func(c echo.Context) error {
		for k, v := range c.Request().Header {
			fmt.Printf("%s - %q\n", k, v)
		}
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
				log.Printf("err : %q", err)
				return err
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

			} else {

				newMessage := clientMessage
				newMessage.Rooms = nil
				if clientMessage.Type == "file" {
					newMessage.Type = "file"
				} else {
					newMessage.Type = "default"
				}
				ctx := context.Background()
				txn, err := db.Begin(ctx)
				if err != nil {
					log.Println(err)
				}
				txn.QueryRow(ctx, "select id from users where username=$1", clientMessage.UserName).Scan(&userId)
				txn.QueryRow(ctx, "select id from rooms where roomname=$1", clientMessage.RoomName).Scan(&roomId)
				txn.Exec(ctx, "insert into messages(text,sender_id,room_id,message_type) values($1,$2,$3,$4)", clientMessage.Message, userId, roomId, clientMessage.Type)
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
