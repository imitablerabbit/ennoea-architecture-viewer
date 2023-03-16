// Populate the application info section within the sidebar. This should
// provide buttons to jump the camera to the location of the application
// in the world.

var applicationInfoSidebarElement;

export function init() {
    applicationInfoSidebarElement = document.getElementById('sidebar-application-info');
}

export function displayApplicationData(applicationData) {
    applicationInfoSidebarElement.innerHTML = '';

    for (var i = 0; i < applicationData.applications.length; i++) {
        var app = applicationData.applications[i];

        var appSectionElement = document.createElement('section');
        appSectionElement.classList.add('application-info');

        var appNameElement = document.createElement('h2');
        appNameElement.classList.add('app-name');
        appNameElement.innerText = app.name;
        
        var appColorElement = document.createElement('p');
        appColorElement.classList.add('app-color');
        appColorElement.innerText = app.color;
        appColorElement.style.backgroundColor = app.color;
        var appColorDataElement = generateAppKVDataElement('Color: ', appColorElement);

        var appServerDataElement = document.createElement('div');
        appServerDataElement.classList.add('app-data-list');
        var appServerListTitleElement = document.createElement('p');
        appServerListTitleElement.classList.add('title');
        appServerListTitleElement.innerText = 'Servers:'
        var appServerListElement = document.createElement('ul');
        appServerListElement.classList.add('server-list');
        for (var j = 0; j < app.servers.length; j++) {
            var server = app.servers[j];
            var serverListElement = document.createElement('li');
            serverListElement.classList.add('server');
            serverListElement.innerText = server.name;
            appServerListElement.appendChild(serverListElement);
        }
        appServerDataElement.appendChild(appServerListTitleElement);
        appServerDataElement.appendChild(appServerListElement);

        appSectionElement.appendChild(appNameElement);
        appSectionElement.appendChild(appColorDataElement);
        appSectionElement.appendChild(appServerDataElement);

        applicationInfoSidebarElement.appendChild(appSectionElement);
    }
}

function generateAppKVDataElement(k, vElement) {
    var dataElement = document.createElement('div');
    dataElement.classList.add('app-data-kv');

    var titleElement = document.createElement('p');
    titleElement.classList.add('title');
    titleElement.innerText = k;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}