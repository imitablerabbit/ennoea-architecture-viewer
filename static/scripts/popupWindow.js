// Create a small moveable dialog box with a title and content. The dialog box
// can be moved by dragging the title bar. The dialog box can be closed by
// clicking the close button. The dialog box cannot be moved outside the bounds
// of the element passed to the constructor.

// PopupWindow class.
export class PopupWindow {
    constructor(parentElement, title, contentElement, classList = []) {
        this.parentElement = parentElement;
        this.title = title;
        this.contentElement = contentElement;
        this.classList = classList;

        this.windowElement = null;
        this.titleBarElement = null;
        this.closeButtonElement = null;
        this.contentElementContainer = null;

        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.generateWindow();
    }

    // Generate the dialog box.
    generateWindow() {
        let windowElement = document.createElement('div');
        windowElement.classList.add('popup-window');
        for (let i = 0; i < this.classList.length; i++) {
            windowElement.classList.add(this.classList[i]);
        }
        windowElement.style.opacity = 0;

        let titleBarElement = document.createElement('div');
        titleBarElement.classList.add('title-bar');
        titleBarElement.innerText = this.title;

        let closeButtonElement = document.createElement('button');
        closeButtonElement.classList.add('close');
        closeButtonElement.innerText = 'X';

        let contentElementContainer = document.createElement('div');
        contentElementContainer.classList.add('content');
        contentElementContainer.appendChild(this.contentElement);

        windowElement.appendChild(titleBarElement);
        windowElement.appendChild(closeButtonElement);
        windowElement.appendChild(contentElementContainer);

        this.parentElement.appendChild(windowElement);

        this.windowElement = windowElement;
        this.titleBarElement = titleBarElement;
        this.closeButtonElement = closeButtonElement;
        this.contentElementContainer = contentElementContainer;

        this.addEventListeners();

    }

    // Add event listeners to the dialog box.
    addEventListeners() {
        this.titleBarElement.addEventListener('mousedown', (event) => {
            this.dragging = true;
            this.offsetX = event.clientX - this.windowElement.offsetLeft;
            this.offsetY = event.clientY - this.windowElement.offsetTop;
        });

        this.titleBarElement.addEventListener('mouseup', (event) => {
            this.dragging = false;
        });

        this.titleBarElement.addEventListener('mousemove', (event) => {
            if (this.dragging) {
                let x = event.clientX - this.offsetX;
                let y = event.clientY - this.offsetY;

                // Make sure the dialog box is not moved outside the bounds of
                // the parent element.
                if (x < 0) {
                    x = 0;
                } else if (x + this.windowElement.offsetWidth > this.parentElement.offsetWidth) {
                    x = this.parentElement.offsetWidth - this.windowElement.offsetWidth;
                }

                if (y < 0) {
                    y = 0;
                } else if (y + this.windowElement.offsetHeight > this.parentElement.offsetHeight) {
                    y = this.parentElement.offsetHeight - this.windowElement.offsetHeight;
                }

                this.windowElement.style.left = x + 'px';
                this.windowElement.style.top = y + 'px';
            }
        });

        this.closeButtonElement.addEventListener('click', () => {
            this.destroy();
        });
    }

    // Sets the position of the dialog box. The position is relative to the
    // parent element. This will not account for the width and height of the
    // dialog box. So if you want to center the dialog box, you will need to
    // calculate the position yourself.
    setPosition(x, y) {
        this.windowElement.style.left = x + 'px';
        this.windowElement.style.top = y + 'px';
    }

    // Get the dialog box element in case you want to style it.
    getWindowElement() {
        return this.windowElement;
    }

    // Show the dialog box.
    show() {
        this.windowElement.style.opacity = 1;
    }

    // Destroy the dialog box.
    destroy() {
        this.windowElement.remove();
    }
}
