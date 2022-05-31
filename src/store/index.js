import {createStore} from 'vuex'

export default createStore({
    state: {
        loggedIn: false,
        demo: true,
        options: {}
    },
    getters: {},
    mutations: {
        sessionOnly(state, payload) {
            localStorage.setItem('php_sess_id', payload.sess_id);
        },
        demoLogin(state, payload) {
            state.demo = true;
            state.loggedIn = true;
            if (payload.sess_id !== undefined) {
                localStorage.setItem('php_sess_id', payload.sess_id);
            }
        },
        loadOptions(state, payload) {
            state.options = payload.task_info;
        },
        login(state, payload) {
            state.loggedIn = true;
            if (payload.sess_id !== undefined) {
                localStorage.setItem('php_sess_id', payload.sess_id);
            }
        },
        logout(state) {
            state.loggedIn = false;
            state.demo = false;
            state.options = {};
            localStorage.removeItem('php_sess_id');
        }
    },
    actions: {},
    modules: {}
})
