import gsap from 'gsap';

let gsapAnimating = false;

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

            // Add a mutation observer to the collapsable container so that we can
            // update the max height of the collapsable element when the container
            // or its child elements change.
            let mutationObserver = new MutationObserver(() => {
                if (gsapAnimating) {
                    console.log('skipping mutation gsap animating');
                    return;
                }
                setCollapsableData(collapsable, collapsableToggleText, collapsableContainer);
            });
            mutationObserver.observe(collapsableContainer, { childList: true, subtree: true });
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
    let height = "0px";
    let rotation = "270deg";
    if (collapsable.classList.contains('active')) {
        height = collapsableContainer.scrollHeight + "px";
        rotation = "90deg";
    }
    
    // Adjust the height of the collapsable container so that we can get the
    // height of the container.
    collapsableContainer.style.height = height;
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
    
    let height = collapsableContainer.scrollHeight + "px";
    let newHeight = "0px";
    let rotation = "90deg";
    let newRotation = "270deg";

    if (collapsable.classList.contains('active')) {
        height = "0px";
        newHeight = collapsableContainer.scrollHeight + "px";
        rotation = "270deg";
        newRotation = "90deg";
    }

    let heightPromise = new Promise((resolve, reject) => {
        gsap.fromTo(collapsableContainer, {
            height: height,
        }, {
            height: newHeight,
            duration: 0.5
        }).then(() => {
            resolve();
        });
    });

    // fromTo() is used here instead of to() because we want to
    // animate the rotation from a known starting point. Otherwise
    // the animation will rotate in different directions.
    let rotationPromise = new Promise((resolve, reject) => {
        gsap.fromTo(collapsableToggleText, {
            rotateZ: rotation
        }, {
            rotateZ: newRotation,
            duration: 0.5
        }).then(() => {
            resolve();
        });
    });

    // Set the gsapAnimating flag to true so that we can prevent
    // the resize observer from updating the height of the collapsable
    // container.
    gsapAnimating = true;
    Promise.allSettled([heightPromise, rotationPromise]).then(() => {
        gsapAnimating = false;
    });
}
