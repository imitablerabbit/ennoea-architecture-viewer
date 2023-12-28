package ennoea

import "fmt"

// Architecture represents the architecture configuration.
type Architecture struct {
	Info        Info         `json:"info"`
	Scene       Scene        `json:"scene"`
	Components  []Component  `json:"components"`
	Connections []Connection `json:"connections"`
}

// isValid returns an error if the architecture is invalid.
func (a Architecture) isValid() error {
	// Check that the info is valid
	if err := a.Info.isValid(); err != nil {
		return err
	}

	// Check that the scene is valid
	if err := a.Scene.isValid(); err != nil {
		return err
	}

	// Check that the components are valid
	for _, c := range a.Components {
		if err := c.isValid(); err != nil {
			return err
		}
	}

	// Check that the connections are valid
	for _, connection := range a.Connections {
		if err := connection.isValid(); err != nil {
			return err
		}
	}

	return nil
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

// isValid returns an error if the info is invalid. It does this by
// checking that the name and description are not empty.
func (i Info) isValid() error {
	// There is no need to check the ID because it is generated
	// automatically if it is not provided.

	// Check that the name is not empty
	if i.Name == "" {
		return fmt.Errorf("invalid info: name is empty")
	}

	// Check that the description is not empty
	if i.Description == "" {
		return fmt.Errorf("invalid info: description is empty")
	}

	return nil
}

// Scene represents the scene configuration.
type Scene struct {
	Camera Camera `json:"camera"`
	Fog    Fog    `json:"fog"`
	Text   Text   `json:"text"`
}

// isValid returns an error if the scene is invalid.
func (s Scene) isValid() error {
	// Check that the camera is valid
	if err := s.Camera.isValid(); err != nil {
		return fmt.Errorf("invalid scene: %w", err)
	}

	// Check that the fog is valid
	if err := s.Fog.isValid(); err != nil {
		return fmt.Errorf("invalid scene: %w", err)
	}

	// Check that the text is valid
	if err := s.Text.isValid(); err != nil {
		return fmt.Errorf("invalid scene: %w", err)
	}

	return nil
}

// Camera represents the camera configuration.
type Camera struct {
	Position [3]float64 `json:"position"`
}

// isValid returns an error if the camera is invalid.
func (c Camera) isValid() error {
	// Check that the position is valid
	if err := isValidPosition(c.Position); err != nil {
		return fmt.Errorf("invalid camera: %w", err)
	}

	return nil
}

// Fog represents the fog configuration.
type Fog struct {
	Near float64 `json:"near"`
	Far  float64 `json:"far"`
}

// Fog represents the fog configuration.
func (f Fog) isValid() error {
	// Check that the near value is valid
	if f.Near < 0 {
		return fmt.Errorf("invalid fog: near is negative")
	}

	// Check that the far value is valid. The far value must be
	// greater than 10.
	if f.Far < 10.0 {
		return fmt.Errorf("invalid fog: far is less than 10")
	}

	return nil
}

// Text represents the text configuration.
type Text struct {
	Scale  float64 `json:"scale"`
	Rotate bool    `json:"rotate"`
}

// isValid returns an error if the text settings is invalid.
func (t Text) isValid() error {
	// Check that the scale is valid
	if t.Scale < 0 {
		return fmt.Errorf("invalid text: scale is negative")
	}

	return nil
}

// Application represents the application configuration.
type Component struct {
	Type   string    `json:"type"`
	Name   string    `json:"name"`
	Object *Object3D `json:"object,omitempty"`
}

// isValid returns an error if the component is invalid.
func (c Component) isValid() error {
	// Check that the type is not empty or invalid.
	if c.Type == "" {
		return fmt.Errorf("invalid component: type is empty")
	}
	if c.Type != "application" && c.Type != "server" {
		return fmt.Errorf("invalid component: invalid type: %s", c.Type)
	}

	// Check that the name is not empty
	if c.Name == "" {
		return fmt.Errorf("invalid component: name is empty")
	}

	// Check that the object is valid if it is defined.
	if c.Object != nil {
		if err := c.Object.isValid(); err != nil {
			return fmt.Errorf("invalid component: %w", err)
		}
	}

	return nil
}

// Connection represents the connection configuration.
type Connection struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

// isValid returns an error if the connection is invalid.
func (c Connection) isValid() error {
	// Check that the source is not empty
	if c.Source == "" {
		return fmt.Errorf("invalid connection: source is empty")
	}

	// Check that the target is not empty
	if c.Target == "" {
		return fmt.Errorf("invalid connection: target is empty")
	}

	return nil
}

// Object3D represents a 3D object in the Ennoea Architecture Viewer.
type Object3D struct {
	// Visible determines whether or not the object is visible in the 3D world.
	// By default, the object is visible.
	Visible bool `json:"visible"`

	// Position represents the position of the object in the 3D world.
	// The position is represented as a 3D vector in the x, y, z axis.
	// By default, the position is [0, 0, 0].
	Position [3]float64 `json:"position"`

	// Rotation represents the rotation of the object in the 3D world.
	// The rotation is represented as degrees in the x, y, and z directions.
	// By default, the rotation is [0, 0, 0].
	Rotation [3]float64 `json:"rotation"`

	// Scale represents the scale of the object in the 3D world.
	// By default, the scale is [1, 1, 1].
	Scale [3]float64 `json:"scale"`

	// Geometry represents the geometry of the object in the 3D world.
	Geometry string `json:"geometry"`

	// Color represents the color of the object in the 3D world.
	// The color is represented as a hexadecimal string.
	Color string `json:"color"`
}

// isValid3DObject returns an error if the object is invalid.
// Objects are how the applications and servers will be represented
// in the 3D world.
func (o Object3D) isValid() error {
	// Check that the position is valid
	if err := isValidPosition(o.Position); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the rotation is valid
	if err := isValidRotation(o.Rotation); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the scale is valid
	if err := isValidScale(o.Scale); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the geometry is valid
	if err := isValidGeometry(o.Geometry); err != nil {
		return fmt.Errorf("invalid object: %w", err)
	}

	// Check that the color is valid
	if err := isValidColor(o.Color); err != nil {
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
		return fmt.Errorf("invalid geometry: %s", geometry)
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
func parseHexColor(color string) ([3]int, error) {
	// Check that the color is a valid hexadecimal string
	if len(color) != 7 {
		return [3]int{}, fmt.Errorf("invalid color: invalid len: %s", color)
	}
	if color[0] != '#' {
		return [3]int{}, fmt.Errorf("invalid color: missing '#': %s", color)
	}

	// Parse the hexadecimal values
	var rgb [3]int
	_, err := fmt.Sscanf(color, "#%02x%02x%02x", &rgb[0], &rgb[1], &rgb[2])
	if err != nil {
		return [3]int{}, fmt.Errorf("invalid color: %w: %s", err, color)
	}

	return rgb, nil
}
