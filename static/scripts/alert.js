var alertContainer;

const alertClass = 'alert'
const successClass = 'success';
const errorClass = 'error'

export function init(alertContainerElement) {
    if (alertContainer === null) {
        return;
    }
    alertContainer = alertContainerElement;
}

export function alert(content) {
    createAlert(content);
}

export function success(content) {
    createAlert("Success: " + content, successClass);
}

export function error(content) {
    createAlert("Error: " + content, errorClass);
}

function createAlert(content, ...alertClasses) {
    var ae = generateAlertElement('div', content, alertClasses);
    if (alertContainer != null) {
        alertContainer.appendChild(ae);
    }
}

function generateAlertElement(tag, content, ...alertClasses) {
    var alertElement = document.createElement(tag);
    alertElement.className = alertClass + " " + alertClasses.join(" ");

    var alertTextElement = document.createElement('p');
    alertTextElement.innerHTML = content;

    var alertCloseButton = document.createElement('button');
    alertCloseButton.className = "close";
    alertCloseButton.innerText = 'x';
    alertCloseButton.addEventListener('click', function(event) {
        alertElement.remove();        
    }.bind(alertElement));

    alertElement.appendChild(alertTextElement);
    alertElement.appendChild(alertCloseButton);
    return alertElement;
}