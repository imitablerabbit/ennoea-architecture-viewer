import * as scene from './scene.js';

export {
    generateAppTitleElement,
    generateColorPickerElement,
    generateCheckboxElement,
    generateDropdownElement,
    generateAppKVElementDataElement,
    generateAppKVDataElement,
    generatAppKListDataElement,
    generateVector3InputElements,
    generateNumberInput,
    generateEditableListElement
};

/**
 * Calculates the luma value of a given color.
 * 
 * @param {string} color - The color in hexadecimal format (e.g., "#FFFFFF").
 * @returns {number} The luma value of the color.
 */
function luma(color) {
    color = color.substring(1);
    color = parseInt(color, 16);
    let r = (color >> 16) & 0xff;
    let g = (color >>  8) & 0xff;
    let b = (color >>  0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generates an application title element with the given name, color, and update function.
 * 
 * @param {string} name - The name of the application.
 * @param {function} nameUpdate - The function to be called when the name is updated.
 * @param {string} color - The color of the application.
 * @param {function} colorUpdate - The function to be called when the color is updated.
 * @returns {HTMLElement} The generated application title element.
 */
function generateAppTitleElement(name, nameUpdate, color, colorUpdate) {
    let titleContainer = document.createElement('div');
    titleContainer.classList.add('title-container');

    let nameElement = document.createElement('h2');
    nameElement.classList.add('title');
    nameElement.innerText = name;
    nameElement.contentEditable = true;

    // Update the name when the user exits the content editable.
    nameElement.addEventListener('blur', () => {
        nameUpdate(nameElement.innerText);
    });

    titleContainer.appendChild(nameElement);

    if (color == null) {
        color = 'var(--color-primary)';
    }
    let l = luma(color);
    if (l < 60) {
        nameElement.classList.add('dark');
    }

    // Add a color picker element if the color can be updated.
    if (colorUpdate) {
        let colorDataElement = generateColorPickerElement(color, colorUpdate);
        titleContainer.appendChild(colorDataElement);
    }
    return titleContainer;
}

/**
 * Generates a color picker element.
 * 
 * @param {string} color - The default color value for the color picker.
 * @param {Function} update - The callback function to be called when the color value changes.
 * @returns {HTMLInputElement} The color picker element.
 */
function generateColorPickerElement(color, update) {
    let colorInput = document.createElement('input');
    colorInput.setAttribute('type', 'color');
    colorInput.defaultValue = color;
    colorInput.addEventListener('change', () => {
        update(colorInput.value);
    });
    return colorInput;
}

/**
 * Generates a checkbox element.
 *
 * @param {string} k - The key for the checkbox.
 * @param {boolean} checked - The initial state of the checkbox.
 * @param {Function} update - The callback function to be called when the checkbox state changes.
 * @returns {HTMLElement} The generated checkbox element.
 */
function generateCheckboxElement(k, checked, update) {
    let checkboxElement = document.createElement('input');
    checkboxElement.setAttribute('type', 'checkbox');
    if (checked == null) {
        checked = true;
    }
    checkboxElement.checked = checked;
    checkboxElement.addEventListener('change', () => {
        update(checkboxElement.checked);
    });
    let checkboxDataElement = generateAppKVElementDataElement(k, checkboxElement);
    return checkboxDataElement;
}

/**
 * Generates a dropdown element for selecting a from a list of options.
 * Attaches an event listener to update the selected option.
 * 
 * @param {Array<string>} options - The list of options for the dropdown.
 * @param {string} selected - The currently selected option.
 * @param {function} update - The function to be called when the selected option is updated.
 * @returns {HTMLElement} The generated dropdown element.
 */
function generateDropdownElement(options, selected, update) {
    let dropdown = document.createElement('select');
    dropdown.addEventListener('change', () => {
        update(dropdown.value);
    });

    for (let i = 0; i < options.length; i++) {
        let option = document.createElement('option');
        option.value = options[i];
        option.innerText = options[i];
        if (selected == options[i]) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    }
    return dropdown;
}

// General data element creation functions

/**
 * Generates an app key-value element data element.
 * 
 * @param {string} k - The key for the data element.
 * @param {HTMLElement} vElement - The value element to be appended to the data element.
 * @returns {HTMLElement} - The generated data element.
 */
function generateAppKVElementDataElement(k, vElement) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('info-box-kv');

    let titleElement = document.createElement('p');
    titleElement.classList.add('key');
    titleElement.innerText = k;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}

/**
 * Generates a key-value data element for the application information sidebar.
 * 
 * @param {string} k - The key of the data element.
 * @param {string} v - The value of the data element.
 * @returns {HTMLElement} - The generated data element.
 */
function generateAppKVDataElement(k, v) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('info-box-kv');

    let titleElement = document.createElement('p');
    titleElement.classList.add('key');
    titleElement.innerText = k;

    let vElement = document.createElement('p');
    vElement.classList.add('value');
    vElement.innerText = v;

    dataElement.appendChild(titleElement);
    dataElement.appendChild(vElement);
    return dataElement;
}

/**
 * Generates a data element for the application key list.
 * 
 * @param {string} k - The key for the application list.
 * @param {Array<string>} list - The list of items for the application key.
 * @returns {HTMLElement} - The generated data element.
 */
function generatAppKListDataElement(k, list) {
    let dataElement = document.createElement('div');
    dataElement.classList.add('info-box-ul');
    let appListTitleElement = document.createElement('p');
    appListTitleElement.classList.add('key');
    appListTitleElement.innerText = k
    let ulElement = document.createElement('ul');
    ulElement.classList.add('value');
    for (let j = 0; j < list.length; j++) {
        let li = list[j];
        let liElement = document.createElement('li');
        liElement.innerText = li;
        ulElement.appendChild(liElement);
    }
    dataElement.appendChild(appListTitleElement);
    dataElement.appendChild(ulElement);
    return dataElement
}

/**
 * Generates a container with input elements for a 3D vector.
 * 
 * @param {number[]} vs - The initial values of the vector.
 * @param {string[]} labels - The labels for each input element.
 * @param {function} update - The callback function to be called when the value of an input element changes.
 * @param {number} [step=1] - The step value for the input elements.
 * @param {number|null} [min=null] - The minimum value for the input elements.
 * @param {number|null} [max=null] - The maximum value for the input elements.
 * @returns {HTMLElement} - The container element with the input elements.
 */
function generateVector3InputElements(vs, labels, update, step = 1, min = null, max = null) {
    let container = document.createElement('div');
    container.classList.add('vector-input-container');

    for (let i = 0; i < labels.length; i++) {
        let value = vs[i];
        let label = labels[i];
        let onChange = (newValue) => {
            update(i, newValue);
        }
        let input = generateNumberInput(value, label, onChange, step, min, max);
        container.appendChild(input);
    }
    return container;
}

/**
 * Generates a number input element with a label and optional min/max values.
 * 
 * @param {number} value - The initial value of the number input.
 * @param {string} label - The label text for the number input.
 * @param {function} onChange - The callback function to be called when the value of the number input changes.
 * @param {number} [step=1] - The step value for the number input.
 * @param {number|null} [min=null] - The minimum value allowed for the number input.
 * @param {number|null} [max=null] - The maximum value allowed for the number input.
 * @returns {HTMLElement} - The container element containing the label and number input.
 */
function generateNumberInput(value, label, onChange, step = 1, min = null, max = null) {
    let container = document.createElement('div');
    container.classList.add('number-input-container');

    let labelElement = document.createElement('p');
    labelElement.innerText = label;

    let input = document.createElement('input');
    input.value = value;
    input.setAttribute('type', 'number');
    input.setAttribute('step', step);
    input.addEventListener('change', () => {
        let value = input.value;
        let parsedValue = parseFloat(value);
        onChange(parsedValue);
    });
    if (min != null) {
        input.setAttribute('min', min);
    }
    if (max != null) {
        input.setAttribute('max', max);
    }

    container.appendChild(labelElement);
    container.appendChild(input);
    return container;
}

// Generates an editable list. This element contains a select element
// generated from a list of options. Next to the dropdown select element
// is a button to add a new item to the list. When the add button is clicked,
// the option is added to the div below the select and add button. Each item
// in the list has a remove button that removes the item from the list.
// Whenever an item is added or removed, the update function is called with
// the new list of items.
function generateEditableListElement(list, update, options=[]) {
    let container = document.createElement('div');
    container.classList.add('editable-list-container');
    container.classList.add('grid-3');

    let select = document.createElement('select');
    for (let i = 0; i < options.length; i++) {
        let option = document.createElement('option');
        option.innerText = options[i];
        select.appendChild(option);
    }
    select.classList.add('span-2');

    let add = document.createElement('button');
    add.innerText = 'Add';
    add.addEventListener('click', () => {
        let item = select.value;
        list.push(item);
        update(list);
        let itemElement = generateEditableListItemElement(item, list, update);
        container.appendChild(itemElement);
    });

    container.appendChild(select);
    container.appendChild(add);

    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let itemElement = generateEditableListItemElement(item, list, update);
        itemElement.classList.add('span-3');
        container.appendChild(itemElement);
    }

    return container;
}

// Generates a list item for the editable list element.
// This element contains a button to remove the item from the list.
function generateEditableListItemElement(item, list, update) {
    let container = document.createElement('div');
    container.classList.add('editable-list-item-container');
    container.classList.add('grid-3');

    let itemElement = document.createElement('p');
    itemElement.innerText = item;
    itemElement.classList.add('span-2');

    let remove = document.createElement('button');
    remove.innerText = 'Remove';
    remove.addEventListener('click', () => {
        let index = list.indexOf(item);
        list.splice(index, 1);
        update(list);
        container.remove();
    });

    container.appendChild(itemElement);
    container.appendChild(remove);
    return container;
}
