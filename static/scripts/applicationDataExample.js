export var applicationData = {
    scene: {
        camera: {
            position: [0, 20, 20]
        },
        fog: {
            near: 0,
            far: 100
        },
        text: {
            scale: 1,
            rotate: true
        }
    },
    connections: [
        {
            source: "Endpoints",
            target: "Gary",
        },
        {
            source: "Gary",
            target: "NPD",
        },
        {
            source: "Gary",
            target: "Ratman",
        },
        {
            source: "Clogger",
            target: "Squirtl",
        },
        {
            source: "Squirtl",
            target: "Luminus",
        },
        {
            source: "Luminus",
            target: "AppPlatform",
        },
        {
            source: "AppPlatform",
            target: "Hadoop",
        },
        {
            source: "Bingo",
            target: "Clogger",
        },
        {
            source: "Bingo",
            target: "Papaya",
        },
        {
            source: "Papaya",
            target: "Bread",
        },
        {
            source: "Bread",
            target: "Bread Replica",
        },
        {
            source: "Papaya",
            target: "Magic Baby (MBS)",
        },
        {
            source: "Magic Baby (MBS)",
            target: "LMNOP",
        },
        {
            source: "LMNOP",
            target: "Raccoon",
        },
        {
            source: "Raccoon",
            target: "WNGMAN",
        },
        {
            source: "WNGMAN",
            target: "RGS",
        },
        {
            source: "WNGMAN",
            target: "BRB-DLL",
        },
        {
            source: "WNGMAN",
            target: "PCP (Legacy)",
        },
        {
            source: "WNGMAN",
            target: "Galactus",
        },
        {
            source: "Galactus",
            target: "EKS",
        },
        {
            source: "Galactus",
            target: "OMEGA STAR",
        }
    ],
    applications: [
        {
            name: "Bingo",
            color: "#0287fc",
            servers: [
                {
                    name: "app1hostname2"
                },
                {
                    name: "app1hostname2"
                }
            ],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [2, 2, 2]
        },
        {
            name: "Clogger",
            color: "#ea5c46",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [0, 0, -10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Endpoints",
            color: "#85ea46",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [-15, 0, -20],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Gary",
            color: "#f380f7",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [-10, 0, -10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "NPD",
            color: "#000080",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [-13, 0, -5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Ratman",
            color: "#f1f747",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [-7, 0, -5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Papaya",
            color: "#FF7431",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [0, 0, 10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Bread",
            color: "#EFD2A8",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [-10, 0, 15],
            rotation: [0, 0, 0],
            scale: [1, 0.8, 1],
            geometry: "cylinder"
        },
        {
            name: "Bread Replica",
            color: "#EFD2A8",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [-10, -4.5, 15],
            rotation: [0, 0, 0],
            scale: [1, 0.8, 1],
            geometry: "cylinder"
        },
        {
            name: "Magic Baby (MBS)",
            color: "#f747f7",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [10, 0, 10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "LMNOP",
            color: "#f7e247",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [5, 0, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Raccoon",
            color: "#666666",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [19, 0, 10 ],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "WNGMAN",
            color: "#4770f7",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [25, 0, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "RGS",
            color: "#aaabaf",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [34, 5, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "BRB-DLL",
            color: "#f42c7f",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [34, 0, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "PCP (Legacy)",
            color: "#97f42c",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [34, -5, 5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Galactus",
            color: "#8701a2",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [40, 0, 0],
            rotation: [0, 0, 0],
            scale: [2, 2, 2],
            geometry: "sphere"
        },
        {
            name: "EKS",
            color: "#3befa4",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [40, 0, -5],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "OMEGA STAR",
            color: "#d0ae06",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [40, 0, -10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Squirtl",
            color: "#06f7fc",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [6, 0, -10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "Luminus",
            color: "#d9e2de",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [11, 0, -10],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        },
        {
            name: "AppPlatform",
            color: "#822405",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [18, 0, -13],
            rotation: [0, 0, 0],
            scale: [3, 1, 1]
        },
        {
            name: "Hadoop",
            color: "#e0ef3b",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [18, -4, -13],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        }
    ]
}
