package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vansh845/letschat/server/ws"
)

func Start(port string) {
	e := echo.New()
	e.Static("/static", "ui/dist")
	e.Static("/assets", "ui/dist/assets")

	e.GET("/chat", ws.WebsocketHandler)
	e.GET("/group/:groupid", ws.GroupChatHandler)
	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "PONG")
	})

	e.Logger.Fatal(e.Start(port))
}
