package main

import (
	"flag"
	"fmt"
	"net/http"
)

var (
	portFlag        = flag.Int("port", 8080, "the port number that this server should listen on")
	staticFilesFlag = flag.String("static", "build/static", "the static file directory")
)

func main() {
	flag.Parse()

	listenAddress := fmt.Sprintf(":%d", *portFlag)

	http.Handle("/static/",
		http.StripPrefix("/static/",
			http.FileServer(
				http.Dir(*staticFilesFlag+"/"))))

	http.Handle("/",
		http.FileServer(
			http.Dir(*staticFilesFlag+"/html")))

	http.ListenAndServe(listenAddress, nil)
}
