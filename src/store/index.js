import {createStore} from 'vuex'

export default createStore({
    state: {
        loggedIn: false,
        options: {}
    },
    getters: {},
    mutations: {
        sessionOnly(state, payload) {
            localStorage.setItem('php_sess_id', payload.sess_id);
        },
        login(state, payload) {
            state.loggedIn = true;
            state.options = payload.task_info;
            if (payload.sess_id !== undefined) {
                localStorage.setItem('php_sess_id', payload.sess_id);
            }
        },
        logout(state) {
            state.loggedIn = false;
            state.options = {};
            localStorage.removeItem('php_sess_id');
        }
    },
    actions: {},
    modules: {}
})
