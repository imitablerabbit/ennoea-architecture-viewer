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

	http.Handle("/static/css/",
		http.StripPrefix("/static/css/",
			http.FileServer(
				http.Dir(*staticFilesFlag+"/css"))))
	http.Handle("/static/images/",
		http.StripPrefix("/static/images/",
			http.FileServer(
				http.Dir(*staticFilesFlag+"/images"))))
	http.Handle("/static/scripts/",
		http.StripPrefix("/static/scripts/",
			http.FileServer(
				http.Dir(*staticFilesFlag+"/scripts"))))
	http.Handle("/",
		http.FileServer(
			http.Dir(*staticFilesFlag+"/html")))

	http.ListenAndServe(listenAddress, nil)
}
