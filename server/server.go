package server

import (
	"github.com/labstack/echo/v4"
)

func Start(port string) {
	e := echo.New()
	e.Static("/", "ui/dist")
	e.Static("/assets", "ui/dist/assets")

	e.Logger.Fatal(e.Start(port))
}
