/**
 * Represents a controller for managing the architecture state and notifying subscribers.
 */
export class ArchitectureController {
    constructor() {
        this.architectureState = null;
        this.subscribers = [];
    }

    /**
     * Get the current architecture state.
     * @returns {any} The architecture state.
     */
    getArchitectureState() {
        return this.architectureState;
    }

    /**
     * Set the new architecture state and notify subscribers.
     * @param {any} newArchitectureState - The new architecture state.
     */
    setArchitectureState(newArchitectureState) {
        this.architectureState = newArchitectureState;
        this.notifySubscribers();
    }

    /**
     * Subscribe a new subscriber to receive architecture state updates.
     * @param {Function} subscriber - The subscriber function.
     */
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }

    /**
     * Unsubscribe a subscriber from receiving architecture state updates.
     * @param {Function} subscriber - The subscriber function.
     */
    unsubscribe(subscriber) {
        const index = this.subscribers.indexOf(subscriber);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    }

    /**
     * Notify all subscribers with the current architecture state.
     * If a subscriber throws an error, then we will continue
     * notifying the other subscribers.
     */
    notifySubscribers() {
        this.subscribers.forEach(subscriber => {
            try {
                subscriber(this.architectureState);
            } catch (error) {
                console.error(error);
            }
        });
    }
}
