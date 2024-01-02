package main

import (
	"ennoea/pkg/ennoea"
	"flag"
	"fmt"
	"net/http"
	"os"
)

var (
	portFlag        = flag.Int("port", 8080, "the port number that this server should listen on")
	staticFilesFlag = flag.String("static", "build/static", "the static file directory")
	saveDirFlag     = flag.String("save-dir", "saves", "the directory to save files to")
)

var (
	// architectureHandler is the handler for the architecture routes.
	architectureHandler *ennoea.ArchitectureHandler
)

func main() {
	flag.Parse()
	listenAddress := fmt.Sprintf(":%d", *portFlag)

	// Initialize the server components
	initialize()

	// Handle the architecture routes
	setupRoutes()

	// Start the server
	fmt.Printf("listening on %s\n", listenAddress)
	http.ListenAndServe(listenAddress, nil)
}

func initialize() {
	// Ensure that the save directory exists.
	err := ensureDirectoryExists(*saveDirFlag)
	if err != nil {
		panic(err)
	}

	// Create the architecture handler for saving and loading.
	architectureHandler, err = ennoea.NewArchitectureHandler(*saveDirFlag)
	if err != nil {
		panic(err)
	}
}

func setupRoutes() {
	// Handle the architecture saving loading routes
	http.Handle("/architectures/", architectureHandler)

	// Handle the static file routes
	http.Handle("/static/",
		http.StripPrefix("/static/",
			http.FileServer(
				http.Dir(*staticFilesFlag+"/"))))

	// Handle the root route
	http.Handle("/",
		http.FileServer(
			http.Dir(*staticFilesFlag+"/html")))
}

// ensureDirectoryExists ensures that the directory exists.
// If the directory does not exist, it will be created.
func ensureDirectoryExists(dir string) error {
	// Check if the directory exists
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// Create the directory
		err := os.Mkdir(dir, 0755)
		if err != nil {
			return fmt.Errorf("failed to create directory: %v", err)
		}
	}

	return nil
}
