var nameElement
var descriptionElement

/**
 * Initializes the sidebar file info.
 * 
 * @param {Object} archController - The architecture controller object.
 * @returns {Promise} A promise that resolves when the initialization is complete.
 */
export function init(archController) {
    return new Promise((resolve, reject) => {
        if (archController === undefined) {
            reject({error: 'archController is undefined'});
            return;
        }

        nameElement = document.getElementById('file-info-name-text');
        if (nameElement === null) {
            reject({error: 'file-info-name-text not found'});
            return;
        }
        descriptionElement = document.getElementById('file-info-description-text');
        if (descriptionElement === null) {
            reject({error: 'file-info-description-text not found'});
            return;
        }

        // Subscribe to the archController for notifications
        archController.subscribe((applicationData) => {
            updateFileInfo(applicationData);
        });

        resolve();
    });
}

/**
 * Updates the file information in the sidebar.
 * 
 * @param {Object} applicationData - The data object containing the application information.
 * @param {string} applicationData.name - The name of the application.
 * @param {string} applicationData.description - The description of the application.
 * @returns {void}
 */
function updateFileInfo(applicationData) {
    if (applicationData === undefined) {
        return;
    }
    let info = applicationData.info;
    if (info === undefined) {
        console.log('info is undefined', applicationData);
        return;
    }
    nameElement.textContent = info.name;
    nameElement.classList.remove('undefined');
    descriptionElement.textContent = info.description;
    descriptionElement.classList.remove('undefined');
}
