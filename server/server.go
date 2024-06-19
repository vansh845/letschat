package server

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vansh845/letschat/server/ws"
)

func Start(port string) {

	e := echo.New()
	e.Static("/static", "ui/dist")
	e.Static("/assets", "ui/dist/assets")

	logger := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			fmt.Println(c.Request().RemoteAddr)
			return next(c)
		}
	}

	e.GET("/chat", ws.WebsocketHandler, logger)
	e.GET("/group/:groupid", ws.GroupChatHandler)
	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "PONG")
	})

	e.Logger.Fatal(e.Start(port))
}
