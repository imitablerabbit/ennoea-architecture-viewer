package ennoea

import "fmt"

// Architecture represents the architecture configuration.
type Architecture struct {
	Info         Info          `json:"info"`
	Scene        Scene         `json:"scene"`
	Applications []Application `json:"applications"`
	Connections  []Connection  `json:"connections"`
}

// Info represents higher level information about the architecture.
type Info struct {
	// ID is the unique identifier of the architecture. The ID is
	// used to load the architecture file from the save directory.
	ID string `json:"id"`

	// Name is the name of the architecture. The name is used to
	// identify the architecture in the UI when loading and saving.
	Name string `json:"name"`

	// Description is the description of the architecture. The
	// description is used to provide more information about the
	// architecture.
	Description string `json:"description"`
}

// Scene represents the scene configuration.
type Scene struct {
	Camera Camera `json:"camera"`
	Fog    Fog    `json:"fog"`
	Text   Text   `json:"text"`
}

// Camera represents the camera configuration.
type Camera struct {
	Position [3]float64 `json:"position"`
}

// Fog represents the fog configuration.
type Fog struct {
	Near float64 `json:"near"`
	Far  float64 `json:"far"`
}

// Text represents the text configuration.
type Text struct {
	Scale  float64 `json:"scale"`
	Rotate bool    `json:"rotate"`
}

// Application represents the application configuration.
type Application struct {
	Name  string `json:"name"`
	Color string `json:"color"`
	Object3D
}

type Server struct {
	Name string `json:"name"`
	Object3D
}

// Connection represents the connection configuration.
type Connection struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type Object3D struct {
	// Position is the position of the object in the 3D world.
	// The position is represented as a 3D vector in the x, y, z axis.
	// By default, the position is [0, 0, 0].
	Position [3]float64 `json:"position"`

	// Rotation is the rotation of the object in the 3D world.
	// The rotation is represented as degrees in the x, y, and z
	// directions. By default, the rotation is [0, 0, 0].
	Rotation [3]float64 `json:"rotation"`

	// Scale is the scale of the object in the 3D world. By
	// default, the scale is [1, 1, 1].
	Scale [3]float64 `json:"scale"`

	// Geometry is the geometry of the object in the 3D world.
	Geometry string `json:"geometry"`

	// Color is the color of the object in the 3D world.
	// The color is represented as a hexadecimal string.
	Color string `json:"color"`
}

// isValid3DObject returns an error if the object is invalid.
// Objects are how the applications and servers will be represented
// in the 3D world.
func isValid3DObject(object Object3D) error {
	// Check that the position is valid
	if err := isValidPosition(object.Position); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the rotation is valid
	if err := isValidRotation(object.Rotation); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the scale is valid
	if err := isValidScale(object.Scale); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the geometry is valid
	if err := isValidGeometry(object.Geometry); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the color is valid
	if err := isValidColor(object.Color); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	return nil
}

// isValidPosition returns an error if the position is invalid.
// The position is represented as a 3D vector in the x, y, z axis.
func isValidPosition(position [3]float64) error {
	// Check that the position is a valid 3D vector
	if len(position) != 3 {
		return fmt.Errorf("invalid position")
	}

	return nil
}

// isValidRotation returns an error if the rotation is invalid.
// The rotation is represented as degrees in the x, y, and z
// directions.
func isValidRotation(rotation [3]float64) error {
	// Check that the rotation is a valid 3D vector
	if len(rotation) != 3 {
		return fmt.Errorf("invalid rotation")
	}

	return nil
}

// isValidScale returns an error if the scale is invalid.
// The scale is represented as a 3D vector in the x, y, z axis.
func isValidScale(scale [3]float64) error {
	// Check that the scale is a valid 3D vector
	if len(scale) != 3 {
		return fmt.Errorf("invalid scale")
	}

	return nil
}

// isValidGeometry returns an error if the geometry is invalid.
// Geometries are how the server will be represented in the 3D world.
func isValidGeometry(geometry string) error {
	switch geometry {
	case "box":
		return nil
	case "capsule":
		return nil
	case "circle":
		return nil
	case "cone":
		return nil
	case "cylinder":
		return nil
	case "dodecahedron":
		return nil
	case "icosahedron":
		return nil
	case "octahedron":
		return nil
	case "plane":
		return nil
	case "ring":
		return nil
	case "sphere":
		return nil
	case "tetrahedron":
		return nil
	case "torus":
		return nil
	case "torusKnot":
		return nil
	default:
		return fmt.Errorf("invalid geometry")
	}
}

// isValidColor returns an error if the color is invalid.
// We just need to check that the color is a valid hexadecimal string.
func isValidColor(color string) error {
	// Check that the color is a valid hexadecimal string
	_, err := parseHexColor(color)
	if err != nil {
		return fmt.Errorf("invalid color: %w", err)
	}

	return nil
}

// parseHexColor parses a hexadecimal color string and returns the
// corresponding RGB values. The color string must be in the format
// "#RRGGBB" where RR, GG, and BB are hexadecimal values for the red,
// green, and blue channels respectively.
func parseHexColor(color string) ([3]float64, error) {
	// Check that the color is a valid hexadecimal string
	if len(color) != 7 {
		return [3]float64{}, fmt.Errorf("invalid color: %s", color)
	}
	if color[0] != '#' {
		return [3]float64{}, fmt.Errorf("invalid color: %s", color)
	}

	// Parse the hexadecimal values
	var rgb [3]float64
	_, err := fmt.Sscanf(color, "#%02x%02x%02x", &rgb[0], &rgb[1], &rgb[2])
	if err != nil {
		return [3]float64{}, fmt.Errorf("invalid color: %s", color)
	}

	// Convert the hexadecimal values to the range [0, 1]
	for i := 0; i < 3; i++ {
		rgb[i] /= 255
	}

	return rgb, nil
}
