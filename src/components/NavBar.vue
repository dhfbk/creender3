<template>
    <nav class="navbar navbar-light bg-light navbar-expand-md">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">
                <img :src="`${publicPath}/img/creender-top.png`" alt="Kid Actions logo" height="30">
            </router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link">Home</router-link>
                        <!-- <a class="nav-link active" aria-current="page" href="#">Home</a> -->
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" @click="logout()">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script setup>
import {inject} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router';

const axios = inject('axios')
const updateAxiosParams = inject('updateAxiosParams');
const store = useStore();
const router = useRouter();
const publicPath = process.env.BASE_URL;

function logout() {
    // No comment...
    const params = {"params": {"action": "logout", ...updateAxiosParams()}};
    store.commit("logout");
    axios.get("?", params)
        .then(() => {
            router.push("/");
        });
}

</script>

<style>
</style>
