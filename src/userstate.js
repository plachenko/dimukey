import { writable } from "svelte/store";

export const userstate = writable({
    socket: {
        id: '',
        users: []
    }
});