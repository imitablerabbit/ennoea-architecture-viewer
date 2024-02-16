/**
 * Represents a controller for managing the architecture state and notifying subscribers.
 */
export class ArchitectureController {
    constructor() {
        this.architectureState = null;
        this.subscribers = [];
    }

    /**
     * Get the current architecture state. If the architecture state is an
     * object, then we will clone it before returning it.
     * @returns {any} The architecture state.
     */
    getArchitectureState() {
        if (typeof this.architectureState === 'object' && this.architectureState !== null) {
            return structuredClone(this.architectureState);
        }
        return this.architectureState;
    }

    /**
     * Set the new architecture state and notify subscribers. If the architecture
     * state is an object, then we will clone it before setting it.
     * @param {any} newArchitectureState - The new architecture state.
     */
    setArchitectureState(newArchitectureState) {
        if (typeof newArchitectureState === 'object' && newArchitectureState !== null) {
            newArchitectureState = structuredClone(newArchitectureState);
        }
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
                console.log('notify subscriber');
                console.log(subscriber);
                subscriber(this.getArchitectureState());
            } catch (error) {
                console.error(error);
            }
        });
    }
}
