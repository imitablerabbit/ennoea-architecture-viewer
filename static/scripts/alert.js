import gsap from "gsap";

var alertContainer;

const alertClass = 'alert'
const successClass = 'success';
const errorClass = 'error'

/**
 * Initializes the alert functionality.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 */
export function init() {
    return new Promise((resolve, reject) => {
        alertContainer = document.getElementById('alert-container');
        resolve();
    });
}

/**
 * Creates an alert with the given content.
 * @param {string} content - The content of the alert.
 */
export function alert(content) {
    createAlert(content);
}

/**
 * Displays a success alert with the given content.
 * @param {string} content - The content to be displayed in the success alert.
 */
export function success(content) {
    createAlert("Success: " + content, successClass);
}

/**
 * Displays an error alert with the given content.
 * @param {string} content - The content of the error alert.
 */
export function error(content) {
    createAlert("Error: " + content, errorClass);
}

/**
 * Creates an alert with the given content and optional alert classes.
 * @param {string} content - The content of the alert.
 * @param {...string} alertClasses - Optional classes to be applied to the alert.
 */
function createAlert(content, ...alertClasses) {
    var alertElement = generateAlertElement('section', content, alertClasses);
    if (alertContainer != null) {
        alertContainer.appendChild(alertElement);
    }

    alertElement.style.opacity = "0%";
    alertElement.style.right = "-100%";
    var tl = gsap.timeline({delay: 0});
    tl.to(alertElement, {
            opacity: "100%",
            right: "0%",
            duration: 0.5
        })
       .to(alertElement, {bottom: "10px", duration: 0.2})
       .to(alertElement, {bottom: "0px", duration: 0.2});

    setTimeout(() => closeAlert(alertElement), 5 * 1000);
}

/**
 * Generates an alert element with the specified tag, content, and alert classes.
 * @param {string} tag - The HTML tag for the alert element.
 * @param {string} content - The content to be displayed in the alert element.
 * @param {...string} alertClasses - Additional classes to be added to the alert element.
 * @returns {HTMLElement} - The generated alert element.
 */
function generateAlertElement(tag, content, ...alertClasses) {
    var alertElement = document.createElement(tag);
    alertElement.className = alertClass + " " + alertClasses.join(" ");

    var alertTextElement = document.createElement('p');
    alertTextElement.innerHTML = content;

    var alertCloseButton = document.createElement('button');
    alertCloseButton.className = "close";
    alertCloseButton.innerText = 'x';
    alertCloseButton.addEventListener('click', event => closeAlert(alertElement));

    alertElement.appendChild(alertTextElement);
    alertElement.appendChild(alertCloseButton);
    return alertElement;
}

/**
 * Closes the alert element.
 * @param {HTMLElement} alertElement - The alert element to be closed.
 */
function closeAlert(alertElement) {
    var tl3 = gsap.timeline({delay: 0});
    tl3.to(alertElement, {
        right: "-100%",
        opacity: "0",
        duration: 0.5,
        onComplete: () => alertElement.remove()
    });
}
