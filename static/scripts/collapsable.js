import gsap from 'gsap';

/**
 * Initializes the collapsable functionality. This function should be called
 * after the page has loaded.
 * 
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 */
export function init() {
    return new Promise((resolve, reject) => {
        let collapsables = document.getElementsByClassName('collapsable');
        for (let i = 0; i < collapsables.length; i++) {
            let collapsable = collapsables[i];
            let collapsableToggle = collapsable.querySelector('.collapsable-toggle');
            let collapsableToggleText = collapsableToggle.querySelector('.collapsable-toggle-text');
            let collapsableContainer = collapsable.querySelector('.collapsable-container');
            setCollapsableData(collapsable, collapsableToggleText, collapsableContainer);

            // Add a click event listener to the collapsable toggle so that we can
            // toggle the collapsable element.
            collapsableToggle.addEventListener('click', () => {
                toggleCollapsable(collapsable, collapsableToggleText, collapsableContainer)
            });
            
            // Add a resize observer to the collapsable container so that we can
            // update the max height of the collapsable element when the container
            // resizes.
            let resizeObserver = new ResizeObserver(() => {
                setCollapsableData(collapsable, collapsableToggleText, collapsableContainer);
            });
            resizeObserver.observe(collapsableContainer);
        }
        resolve();
    });
}

/**
 * Sets the data for a collapsable element.
 * 
 * @param {HTMLElement} collapsable - The collapsable element.
 * @param {HTMLElement} collapsableToggleText - The toggle text element of the collapsable.
 * @param {HTMLElement} collapsableContainer - The container element of the collapsable.
 */
function setCollapsableData(collapsable, collapsableToggleText, collapsableContainer) {
    let maxHeight = "25px";
    let rotation = "270deg";
    if (collapsable.classList.contains('active')) {
        maxHeight = collapsableContainer.clientHeight + "px";
        rotation = "90deg";
    }
    collapsable.style.maxHeight = maxHeight;
    collapsableToggleText.style.transform = "rotateZ(" + rotation + ")";
}

/**
 * Toggles the collapsable element and animates the height and rotation.
 * @param {HTMLElement} collapsable - The collapsable element to toggle.
 * @param {HTMLElement} collapsableToggleText - The text element to animate the rotation.
 * @param {HTMLElement} collapsableContainer - The container element whose height will be animated.
 */
function toggleCollapsable(collapsable, collapsableToggleText, collapsableContainer) {
    collapsable.classList.toggle('active');

    let maxHeight = "25px";
    let rotation = "90deg";
    let newRotation = "270deg";
    if (collapsable.classList.contains('active')) {
        maxHeight = collapsableContainer.clientHeight + "px";
        rotation = "270deg";
        newRotation = "90deg";
    }

    gsap.to(collapsable, {
        maxHeight: maxHeight,
        duration: 0.5
    });

    // fromTo() is used here instead of to() because we want to
    // animate the rotation from a known starting point. Otherwise
    // the animation will rotate in different directions.
    gsap.fromTo(collapsableToggleText, {
        rotateZ: rotation
    }, {
        rotateZ: newRotation,
        duration: 0.5
    });
}
