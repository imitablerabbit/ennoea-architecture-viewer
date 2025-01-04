/**
 * Class representing an EventStack.
 * @class
 */
class EventStack {
    /**
     * Create an EventStack.
     * @constructor
     */
    constructor() {
        /**
         * A mapping of event types to event stacks. Each event stack is an array of event functions.
         * @type {Object.<string, Array.<Function>>}
         * @private
         * @property
         */
        this.eventStacks = {};
    }

    /**
     * Subscribe to a DOM event.
     * @param {string} event - The DOM event to subscribe to.
     * @param {Function} callback - The event function to be called when the event is triggered.
     */
    subscribe(event, callback) {
        if (!this.eventStacks[event]) {
            this.eventStacks[event] = [];
            document.addEventListener(event, this.handleEvent.bind(this));
        }
        this.eventStacks[event].push(callback);
    }

    /**
     * Unsubscribe from a DOM event.
     * @param {string} event - The DOM event to unsubscribe from.
     * @param {Function} callback - The event function to be unsubscribed.
     */
    unsubscribe(event, callback) {
        let eventStack = this.eventStacks[event];
        if (eventStack) {
            let index = eventStack.indexOf(callback);
            if (index !== -1) {
                eventStack.splice(index, 1);
            }
        }
    }

    /**
     * Handle a DOM event. This will trigger all subscribed event functions for the event.
     * We will override the stopImmediatePropagation method of the event so that we can
     * stop the event from propagating to other event functions.
     * @param {Event} event - The DOM event to be handled.
     */
    handleEvent(event) {
        let eventStack = this.eventStacks[event.type];
        if (eventStack) {
            let stopPropagation = false;
            let originalStopImmediatePropagation = event.stopImmediatePropagation;
            event.stopImmediatePropagation = function() {
                originalStopImmediatePropagation.call(event);
                stopPropagation = true;
            };

            // Loop over the event stack in reverse order so that the most recently subscribed event functions are
            // triggered first.
            for (let i = eventStack.length - 1; i >= 0; i--) {
                eventStack[i](event);
                if (stopPropagation) {
                    break;
                }
            }
        }
    }
}

// Create a singleton instance of EventStack
const eventStackInstance = new EventStack();

// Export public functions for the instance's API
export const subscribe = eventStackInstance.subscribe.bind(eventStackInstance);
export const unsubscribe = eventStackInstance.unsubscribe.bind(eventStackInstance);
