<template>
    <div v-if="mainLoaded">
        <!--        <p>{{ loggedIn }}</p>-->
        <LoginForm v-if="!loggedIn" @enterDemo="enterDemo" @submit="submit"/>
        <div v-else>
            <div class="container-lg" id="main-container">
                <NavBar/>
                <div class="my-3">
                    <router-view/>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="spinner-border m-5" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>

    <ModalWindow :show="showModal" :message="modalMessage" id="loginModalWindow" @close="showModal = false">
        <template v-slot:title>Message</template>
        <template v-slot:btn-text>Ok</template>
    </ModalWindow>
</template>

<script setup>

import {computed, inject, onMounted, provide, ref} from 'vue'
import {useStore} from 'vuex'
// import {useRouter} from 'vue-router';

// @ is an alias to /src
import LoginForm from '@/components/LoginForm.vue'
import ModalWindow from '@/components/ModalWindow.vue'
import NavBar from '@/components/NavBar.vue'

let showModal = ref(false);
const modalMessage = ref("");

const mainLoaded = ref(false);

const axios = inject('axios')
const updateAxiosParams = inject('updateAxiosParams');
const store = useStore();

const loggedIn = computed(() => store.state.loggedIn);

function showModalWindow(t) {
    showModal.value = true;
    modalMessage.value = t;
}

provide('showModalWindow', showModalWindow);
// provide('typeOptions', typeOptions);
// provide('formComponents', formComponents);
// provide('adminComponents', adminComponents);

function enterDemo({id, password}) {
    axios.post("?", {
        "action": "task",
        "type": "creender",
        "sub": "enterDemo",
        "id": id,
        "password": password,
        ...updateAxiosParams()
    })
        .then((response) => {
            let sess_id = response.data.session_id;
            store.commit("demoLogin", {"sess_id": sess_id});
            loadUserInfo();
        })
        .catch((reason) => {
            let debugText = reason.response.statusText + " - " + reason.response.data.error;
            showModalWindow(debugText);
        })
        .then(() => {
            // mainLoaded.value = true;
        });
}

function submit({username, password}) {
    axios.get("?", {
        "params": {"action": "userLogin", "username": username, "password": password}
    })
        .then((response) => {
            let sess_id = response.data.session_id;
            store.commit("login", {"sess_id": sess_id});
            loadUserInfo();
        })
        .catch((reason) => {
            showModal.value = true;
            modalMessage.value = reason.response.data?.error
                ? reason.response.data.error
                : reason.response.statusText;
        });
}

async function loadUserInfo() {
    await axios.get("?", {
        "params": {
            "action": "task",
            "type": "creender",
            "sub": "getInfo",
            ...updateAxiosParams()
        }
    })
        .then((response) => {
            store.commit("loadOptions", response.data);
            if (response.data.demo) {
                store.commit("demoLogin", response.data);
            } else {
                store.commit("login", response.data);
            }
        })
        .catch((reason) => {
            store.commit('logout');
            if (reason.response && reason.response.status !== 401) {
                showModal.value = true;
                modalMessage.value = reason.response.statusText;
            }
        })
        .then(() => {
            // mainLoaded.value = true;
        });
}

onMounted(async function () {
    await loadUserInfo();
    mainLoaded.value = true;
});


</script>

<style>
#main-container {
    padding: 0;
}
</style>
