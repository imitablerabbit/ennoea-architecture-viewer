package ennoea

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

/*
Architectures are saved to a directory on the server. The directory
contains other directories, each of which represents a saved
architecture. Each architecture directory contains two files: a
saveInfo.json file and an architecture.json file. The saveInfo.json
file contains information about the saved architecture, such as the
architecture ID, the time the architecture was last saved, and the
architecture name. The architecture.json file contains the
architecture configuration that was saved.

Architecture save directory structure:
saves/
	${architectureID}/
		saveInfo.json
		architecture.json

	${architectureID}/
		saveInfo.json
		architecture.json


Architecture save file structure:
saveInfo.json
{
	"id": "architectureID",
	"lastSaved": "2021-10-10T10:10:10Z",
	"name": "architectureName"
}

architecture.json
{
	"info": {
		"id": "architectureID",
		"name": "architectureName"
		"description": "architectureDescription"
	},
	"scene": {
		"camera": {
			"position": [0, 0, 0]
		},
		"fog": {
			"near": 0,
			"far": 0
		},
		"text": {
			"scale": 0,
			"rotate": false
		}
	},
	"applications": [
		{
			"name": "applicationName",
			"color": "#000000",
			"position": [0, 0, 0],
			"rotation": [0, 0, 0],
			"scale": [0, 0, 0],
			"geometry": "geometryName"
			"servers": [
				{
					"name": "serverName",
					"position": [0, 0, 0],
					"rotation": [0, 0, 0],
					"scale": [0, 0, 0],
					"geometry": "geometryName"
				}
			]
		}
	],
	"connections": [
		{
			"source": "applicationName",
			"target": "applicationName"
		}
	]
}
*/

// ArchitectureSave represents the architecture save configuration.
// This struct is used to save the architecture JSON file and to
// return information about the saved architecture when requested.
type ArchitectureSave struct {
	// ID is the unique identifier of the architecture. The ID is
	// used to load the architecture file from the save directory.
	ID string `json:"id"`

	// Name is the name of the architecture. The name is displayed
	// in the architecture list when the user looks for saved
	// architectures.
	Name string `json:"name"`

	// LastSaved is the time the architecture was last saved.
	LastSaved time.Time `json:"lastSaved"`
}

// ArchitectureHandler handles requests to save and load
// architectures. The handler is responsible for saving
// and loading architecture files from the save directory.
// A user can also request a list of saved architectures.
type ArchitectureHandler struct {
	// architectures is a map of architecture IDs to their
	// corresponding save configuration. The map is used to
	// return information about saved architectures when
	// requested.
	architectures map[string]ArchitectureSave

	// filePath is the path to the directory where architecture
	// files are saved.
	filePath string
}

// NewArchitectureHandler creates a new ArchitectureHandler.
// The handler is responsible for saving and loading
// architecture files from the save directory. A user can also
// request a list of saved architectures.
func NewArchitectureHandler(filePath string) (*ArchitectureHandler, error) {
	a := &ArchitectureHandler{
		architectures: make(map[string]ArchitectureSave),
		filePath:      filePath,
	}
	err := a.loadArchitectureSaves()
	return a, err
}

// loadArchitectureSaves loads the architecture save files from
// the save directory. Each save file "saveInfo.json" is stored
// under a directory named after the architecture ID.
func (h *ArchitectureHandler) loadArchitectureSaves() error {
	// Get a list of all saved architecture JSON files
	files, err := os.ReadDir(h.filePath)
	if err != nil {
		return fmt.Errorf("failed to read architecture files: %v", err)
	}

	// Iterate over the files and load the architecture saves
	for _, file := range files {
		if !file.IsDir() {
			continue
		}

		// Load the architecture save
		arch, err := h.loadArchitectureSave(file.Name())
		if err != nil {
			return fmt.Errorf("failed to load architecture save: %v", err)
		}

		// Add the architecture save to the map
		h.architectures[arch.ID] = arch
	}

	return nil
}

// loadArchitectureSave loads the architecture save file from the
// save directory. The save file is stored under a directory named
// after the architecture ID.
func (h *ArchitectureHandler) loadArchitectureSave(architectureID string) (ArchitectureSave, error) {
	// Load the saveInfo.json file
	filePath := filepath.Join(h.filePath, architectureID, "saveInfo.json")
	file, err := os.ReadFile(filePath)
	if err != nil {
		return ArchitectureSave{}, fmt.Errorf("failed to read saveInfo.json file: %v", err)
	}

	// Unmarshal the JSON file into an ArchitectureSave struct
	var arch ArchitectureSave
	err = json.Unmarshal(file, &arch)
	if err != nil {
		return ArchitectureSave{}, fmt.Errorf("failed to unmarshal saveInfo.json file: %v", err)
	}

	return arch, nil
}

// ServeHTTP handles requests to save and load architectures.
// GET /architectures/
//
//	return a list of saved architectures.
//
// PUT /architectures/
//
//	save an architecture.
//
// GET /architectures/${architectureID}
//
//	load an architecture.
func (h *ArchitectureHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// There are two possible GET requests:
		// 1. GET /architectures/
		// 2. GET /architectures/${architectureID}
		h.handleGetRoute(w, r)
	case http.MethodPut:
		// PUT /architectures/
		h.handlePut(w, r)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Method not allowed")
	}
}

// handleGetRoute handles GET requests to the architecture. There
// are two possible GET requests:
// 1. GET /architectures/
// 2. GET /architectures/${architectureID}
// This function determines which request was made and calls the
// appropriate handler.
func (h *ArchitectureHandler) handleGetRoute(w http.ResponseWriter, r *http.Request) {
	// Get the architecture ID from the request URL
	architectureID := filepath.Base(r.URL.Path)

	// Check if the architecture ID is empty
	if architectureID == "" || architectureID == "architectures" {
		h.handleGetAll(w, r)
		return
	}

	h.handleGetArchitecture(w, r, architectureID)
}

// handleGetAll handles GET requests for all saved architectures.
// GET /architectures/
//
//	return a list of saved architectures.
//
//	Example response:
//	[
//		{
//			"id": "architectureID",
//			"name": "architectureName",
//			"lastSaved": "2021-10-10T10:10:10Z"
//		}
//	]
func (h *ArchitectureHandler) handleGetAll(w http.ResponseWriter, r *http.Request) {
	// Create a list of architectures for each architecture save
	// in the map
	aList := make([]ArchitectureSave, 0, len(h.architectures))
	for _, arch := range h.architectures {
		aList = append(aList, arch)
	}

	// Marshal the architectures into JSON
	file, err := json.Marshal(aList)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to marshal architectures: %v", err)
		return
	}

	// Write the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(file)
}

// handleGetArchitecture handles GET requests for a specific
// architecture.
// GET /architectures/${architectureID}
//
//	load an architecture.
//
//	Example response:
//	{
//		"info": {
//			"id": "architectureID",
//			"name": "architectureName"
//			...
//		},
//		"scene": {
//			"camera": {
//				"position": [0, 0, 0]
//			},
//			...
//		},
//		"applications": [
//			{
//				"name": "applicationName",
//				"color": "#000000",
//				...
//			}
//		],
//		"connections": [
//			{
//				"source": "applicationName",
//				"target": "applicationName"
//			}
//		]
//	}
func (h *ArchitectureHandler) handleGetArchitecture(w http.ResponseWriter, r *http.Request, architectureID string) {
	// Check if the architecture ID is valid
	arch, ok := h.architectures[architectureID]
	if !ok {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Architecture not found")
		return
	}

	// Load the architecture file. The architecture file is stored
	// under a directory named after the architecture ID with the
	// name "architecture.json".
	filePath := filepath.Join(h.filePath, arch.ID, "architecture.json")
	file, err := os.ReadFile(filePath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to read architecture file: %v", err)
		return
	}

	// Write the response.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(file)
}

// handlePut handles PUT requests to save an architecture.
// PUT /architectures/
//
//	save an architecture.
func (h *ArchitectureHandler) handlePut(w http.ResponseWriter, r *http.Request) {
	// Load the architecture from the request body
	arch, err := h.loadArchitecture(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "Failed to load architecture: %v", err)
		return
	}

	// Save the architecture
	err = h.saveArchitecture(arch)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to save architecture: %v", err)
		return
	}

	// Write the response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Architecture saved")
}

// loadArchitecture loads the architecture from the request body.
func (h *ArchitectureHandler) loadArchitecture(rc io.ReadCloser) (Architecture, error) {
	// Unmarshal the request body into an Architecture struct
	var arch Architecture
	err := json.NewDecoder(rc).Decode(&arch)
	if err != nil {
		return Architecture{}, fmt.Errorf("failed to unmarshal architecture: %v", err)
	}

	err = rc.Close()
	if err != nil {
		return Architecture{}, fmt.Errorf("failed to close request body: %v", err)
	}

	return arch, nil
}

// saveArchitecture saves the architecture to the save directory. If
// the architecture ID is empty, a new ID is generated.
func (h *ArchitectureHandler) saveArchitecture(arch Architecture) error {
	// Generate a unique ID for the architecture if it is empty
	if arch.Info.ID == "" {
		arch.Info.ID = generateID()
	}

	// Save the architecture to the save directory
	err := h.saveArchitectureFile(arch)
	if err != nil {
		return fmt.Errorf("failed to save architecture file: %v", err)
	}

	// Save the architecture save file
	err = h.saveArchitectureSave(arch)
	if err != nil {
		return fmt.Errorf("failed to save architecture save file: %v", err)
	}

	// Add the architecture to the map
	h.architectures[arch.Info.ID] = ArchitectureSave{
		ID:        arch.Info.ID,
		LastSaved: time.Now(),
		Name:      arch.Info.Name,
	}

	return nil
}

// saveArchitectureFile saves the architecture file to the save
// directory. The architecture file is stored under a directory
// named after the architecture ID with the name "architecture.json".
func (h *ArchitectureHandler) saveArchitectureFile(arch Architecture) error {
	// Marshal the architecture into JSON
	file, err := json.Marshal(arch)
	if err != nil {
		return fmt.Errorf("failed to marshal architecture: %v", err)
	}

	// Create the architecture directory
	dirPath := filepath.Join(h.filePath, arch.Info.ID)
	err = os.Mkdir(dirPath, 0755)
	if err != nil {
		return fmt.Errorf("failed to create architecture directory: %v", err)
	}

	// Save the architecture file
	filePath := filepath.Join(dirPath, "architecture.json")
	err = os.WriteFile(filePath, file, 0644)
	if err != nil {
		return fmt.Errorf("failed to save architecture file: %v", err)
	}

	return nil
}

// saveArchitectureSave saves the architecture save file to the
// save directory. The architecture save file is stored under a
// directory named after the architecture ID with the name
// "saveInfo.json".
func (h *ArchitectureHandler) saveArchitectureSave(arch Architecture) error {
	// Marshal the architecture save into JSON
	file, err := json.Marshal(ArchitectureSave{
		ID:        arch.Info.ID,
		Name:      arch.Info.Name,
		LastSaved: time.Now(),
	})
	if err != nil {
		return fmt.Errorf("failed to marshal architecture save: %v", err)
	}

	// Save the architecture save file
	filePath := filepath.Join(h.filePath, arch.Info.ID, "saveInfo.json")
	err = os.WriteFile(filePath, file, 0644)
	if err != nil {
		return fmt.Errorf("failed to save architecture save file: %v", err)
	}

	return nil
}

// generateID generates a unique ID. The ID is generated by hashing
// the current time.
func generateID() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())
}
