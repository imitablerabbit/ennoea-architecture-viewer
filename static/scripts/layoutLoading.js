var saveLayoutButton;
var loadLayoutButton;

// Default application data that will be used to generate the scene.
export var applicationData = {
    applications: [
        {
            name: "app1",
            color: "#0287fc",
            servers: [
                {
                    name: "app1hostname2"
                },
                {
                    name: "app1hostname2"
                }
            ],
            position: [0, 0, 0]
        },
        {
            name: "app2",
            color: "#06f7fc",
            servers: [
                {
                    name: "app2hostname1"
                },
                {
                    name: "app2hostname2"
                }
            ],
            position: [10, 0, 0]
        }
    ]
}

export function init() {
    saveLayoutButton = document.getElementById('save-layout');
    loadLayoutButton = document.getElementById('load-layout');

    saveLayoutButton.addEventListener('click', () => save("layout.json", applicationData));
    loadLayoutButton.addEventListener('click', load);
}

async function save(filename, data) {
    let blob = new Blob([JSON.stringify(data)], {
        type: "text/json",
        name: filename
    });
    let saveLink = document.createElement('a');
    saveLink.href = window.URL.createObjectURL(blob);
    saveLink.download = "layout.json";
    document.body.appendChild(saveLink);
    saveLink.click();
    saveLink.remove();
}

async function load() {

}