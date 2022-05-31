<template>
    <div class="container mt-5">
        <div class="row d-flex justify-content-center">
            <div class="col" id="loginForm">
                <div class="card px-5 py-5" id="form1">
                    <form class="form-data text-center">
                        <p>
                            <img id="imglogo" :src="`${publicPath}/img/creender.png`"/>
                        </p>
                        <h1>
                            Creender
                        </h1>

                        <ul class="nav nav-pills center-pills mt-3" id="myTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="home-tab" data-bs-toggle="tab"
                                        data-bs-target="#home" type="button" role="tab" aria-controls="home"
                                        aria-selected="true">Login
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile"
                                        type="button" role="tab" aria-controls="profile" aria-selected="false">Demo
                                </button>
                            </li>
                        </ul>
                        <div class="tab-content mt-3" id="myTabContent">
                            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <div class="text-start">
                                    <div class="forms-inputs mb-4">
                                        <label for="adminlogin">Username:</label>
                                        <input autocomplete="off" type="text" v-model="username"
                                               class="form-control" id="adminlogin"
                                               v-bind:class="{'is-invalid' : !validField(username) && usernameBlurred}"
                                               v-on:blur="usernameBlurred = true">
                                        <div class="invalid-feedback">A valid username is required!</div>
                                    </div>
                                    <div class="forms-inputs mb-4">
                                        <label for="adminpassword">Password:</label>
                                        <input autocomplete="off" type="password" v-model="password"
                                               class="form-control" id="adminpassword"
                                               v-bind:class="{'is-invalid' : !validField(password) && passwordBlurred}"
                                               v-on:blur="passwordBlurred = true">
                                        <div class="invalid-feedback">A valid password is required!</div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <button v-on:click.stop.prevent="submit" class="btn btn-dark w-100">Login</button>
                                </div>

                            </div>
                            <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                <div class="text-start">
                                    <div class="forms-inputs mb-4">
                                        <label for="tasklogin">Task:</label>
                                        <select v-model="task" class="form-control" id="tasklogin">
                                            <option value="0">[Select]</option>
                                            <option v-for="demo in demoList" :value="demo.id" :key="demo.id">
                                                {{ demo.name }}
                                            </option>
                                        </select>
                                        <div class="invalid-feedback">Select a task!</div>
                                    </div>
                                    <div class="forms-inputs mb-4">
                                        <label for="adminpassword2">Password:</label>
                                        <input autocomplete="off" type="password" v-model="password"
                                               class="form-control" id="adminpassword2">
                                        <div class="invalid-feedback">A valid password is required!</div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <button v-on:click.stop.prevent="enterDemo" class="btn btn-dark w-100">Enter demo</button>
                                </div>
                            </div>
                        </div>


                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {defineProps, defineEmits, ref, onMounted, inject} from 'vue'

const emit = defineEmits(['submit', 'enterDemo'])

const username = ref("");
const password = ref("");
const task = ref(0);
const usernameBlurred = ref(false);
const passwordBlurred = ref(false);
const publicPath = process.env.BASE_URL;
const demoList = ref([]);

const axios = inject('axios')
const updateAxiosParams = inject('updateAxiosParams');
const showModalWindow = inject('showModalWindow');

function validField(content) {
    if (content.length > 0) {
        return true;
    }
    return false;
}

function enterDemo() {
    emit("enterDemo", {id: task.value, password: password.value});
}

function submit() {
    usernameBlurred.value = true;
    passwordBlurred.value = true;
    if (validField(username.value) && validField(password.value)) {
        emit("submit", {username: username.value, password: password.value});
    }
}

async function loadDemoList() {
    await axios.get("?", {
        "params": {
            "action": "task",
            "type": "creender",
            "sub": "listDemo",
            ...updateAxiosParams()
        }
    })
        .then((response) => {
            demoList.value = response.data.data;
        })
        .catch((reason) => {
            let debugText = reason.response.statusText + " - " + reason.response.data.error;
            showModalWindow(debugText);
        })
        .then(() => {
            // mainLoaded.value = true;
        });
}

onMounted(async function () {
    await loadDemoList();
});

</script>

<style>
#imglogo {
    width: 200px;
}

#loginForm {
    max-width: 500px;
}

.center-pills {
    display: flex;
    justify-content: center;
}

</style>
