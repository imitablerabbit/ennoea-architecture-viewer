import gsap from 'gsap';

// Initialize the collapsable module. Returns a promise that resolves when the
// collapsable elements has been initialized.
export function init() {
    return new Promise((resolve, reject) => {
        let collapsables = document.getElementsByClassName('collapsable');
        for (let i = 0; i < collapsables.length; i++) {
            let collapsable = collapsables[i];
            let collapsableToggle = collapsable.querySelector('.collapsable-toggle');
            let collapsableToggleText = collapsableToggle.querySelector('.collapsable-toggle-text');
            let collapsableContainer = collapsable.querySelector('.collapsable-container');
            setCollapsableData(collapsable, collapsableToggleText, collapsableContainer);

            collapsableToggle.addEventListener('click', () => {
                toggleCollapsable(collapsable, collapsableToggleText, collapsableContainer)
                });
        }
        resolve();
    });
}

// Set the collapsable element to be active or inactive.
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
