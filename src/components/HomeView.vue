<template>
    <div class="modal fade" id="commentModal" tabindex="-1" aria-labelledby="commentModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="commentModalLabel">Comment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="commentForm">
                    <p>{{ store.state.options.answer }}</p>
                    <div class="radio-value" v-if="store.state.options.allow_multiple_choices">
                        <div class="form-check" v-for="(value, index) in store.state.options.choices" :key="index">
                            <input class="form-check-input" type="checkbox" v-model="formData.values" name="s-value"
                                   :id="'radio-' + index" :value="index" @change="checkData">
                            <label class="form-check-label" :for="'radio-' + index">
                                {{ value }}
                            </label>
                        </div>
                    </div>
                    <div class="radio-value" v-else>
                        <div class="form-check" v-for="(value, index) in store.state.options.choices" :key="index">
                            <input class="form-check-input" type="radio" v-model="formData.value" name="s-value"
                                   :id="'radio-' + index" :value="index" @change="checkData">
                            <label class="form-check-label" :for="'radio-' + index">
                                {{ value }}
                            </label>
                        </div>
                    </div>
                    <div class="alert alert-danger mt-3" :class="{'d-none': hideWarning}">You must select an option.
                    </div>
                    <div class="form-group" v-if="!store.state.options.do_not_ask_for_comment">
                        <label for="message-text" class="col-form-label">{{ store.state.options.comment }}</label>
                        <textarea class="form-control" id="message-text" v-model="formData.comment"
                                  @keyup="checkData"></textarea>
                    </div>
                    <div class="alert alert-danger mt-3" :class="{'d-none': hideCommentWarning}">
                        Insert a comment.
                    </div>
                </div>
                <div class="modal-footer" v-if="submitting">
                    <loading-spinner></loading-spinner>
                    Loading...
                </div>
                <div class="modal-footer" v-else>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" @click="userClickedConfirm" class="btn"
                            :class="{ 'btn-success': buttons.clickedConfirm, 'btn-info': !buttons.clickedConfirm }">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>

    <p v-if="photoLoading">
        <LoadingSpinner/>
        Loading
    </p>
    <div v-else-if="nextPhoto" class="row">
        <div class="col-md-7 col-lg-6 p-0 p-sm-4">
            <img :src="nextPhotoURL" class="img-fluid" id="main-image" alt="Creender image" title="Creender image">
        </div>
        <div class="col-md-5 col-lg-6 p-4 text-center">
            <h5 class="d-sm-block display-5">{{ store.state.options.description }}</h5>
            <div id="photo-form">
                <div v-if="submitting">
                    <loading-spinner></loading-spinner>
                    Loading...
                </div>
                <template v-else>
                    <div v-if="store.state.options.no_show_question">
                        <div class="btn btn-lg me-3" @click="userClickedNo"
                             :class="{ 'btn-success': buttons.clickedNo, 'btn-info': !buttons.clickedNo, 'btn-disabled': !buttons.okToClick, 'c-pointer': buttons.okToClick }"
                             id="btn-no">Yes
                        </div>
                        <div class="btn btn-danger btn-lg" @click="userClickedYes"
                             :class="{ 'btn-disabled': !buttons.okToClick, 'c-pointer': buttons.okToClick }"
                             id="btn-yes">
                            No
                        </div>
                    </div>
                    <div v-else>
                        <div class="btn btn-danger btn-lg me-3" @click="userClickedYes"
                             :class="{ 'btn-disabled': !buttons.okToClick, 'c-pointer': buttons.okToClick }"
                             id="btn-yes">
                            Yes
                        </div>
                        <div class="btn btn-lg" @click="userClickedNo"
                             :class="{ 'btn-success': buttons.clickedNo, 'btn-info': !buttons.clickedNo, 'btn-disabled': !buttons.okToClick, 'c-pointer': buttons.okToClick }"
                             id="btn-no">No
                        </div>
                    </div>
                    <div class="mt-4">
                        <button class="btn btn-outline-secondary" @click.prevent="report">
                            <i class="bi bi-flag"></i>
                            <span class="ms-2">Report this picture as offensive or inappropriate.</span>
                        </button>
                    </div>
                </template>
            </div>
        </div>


    </div>
    <div class="row" v-else>
        <div class="col p-3 mx-3">
            No more photos
        </div>
    </div>

</template>

<script setup>

import {onMounted, inject, ref} from "vue";
import {useStore} from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner";
import {Modal} from 'bootstrap'

const store = useStore();
const axios = inject('axios')
const updateAxiosParams = inject('updateAxiosParams');
const showModalWindow = inject('showModalWindow');
const photoLoading = ref(true);
const hideWarning = ref(true);
const hideCommentWarning = ref(true);

const submitting = ref(false);

const nextPhoto = ref({});
const nextPhotoURL = ref("");
const buttons = ref({
    okToClick: false,
    clickedNo: false,
    clickedConfirm: false
});
const startData = {
    value: -1,
    values: [],
    needComment: false,
    comment: ""
};
const formData = ref({...startData});
let time = 2000;
if (store.state.options.no_delay) {
    time = 0;
}

let myModal;

function checkData() {
    hideWarning.value = true;
    hideCommentWarning.value = true;

    let ret = true;
    if (store.state.options.allow_multiple_choices) {
        if (formData.value.values.length === 0) {
            hideWarning.value = false;
            ret = false;
        }
    } else {
        if (formData.value.value === -1) {
            hideWarning.value = false;
            ret = false;
        }
    }
    if (!store.state.options.do_not_ask_for_comment && store.state.options.comment_is_mandatory) {
        if (formData.value.comment.trim().length === 0) {
            hideCommentWarning.value = false;
            ret = false;
        }
    }
    return ret;
}

function userClickedConfirm() {
    if (submitting.value) {
        return;
    }
    if (!store.state.options.no_dblclick && !buttons.value.clickedConfirm) {
        buttons.value.clickedConfirm = true;
        return;
    }
    if (!checkData()) {
        return;
    }
    submitForm();
}

function userClickedYes() {
    if (submitting.value) {
        return;
    }
    if (!buttons.value.okToClick) {
        return;
    }
    let modalEl = document.getElementById('commentModal');
    modalEl.addEventListener("hide.bs.modal", function () {
        formData.value = {...startData};
    })
    myModal = new Modal(modalEl, {});
    myModal.show();
    formData.value.needComment = true;
}

function userClickedNo() {
    if (submitting.value) {
        return;
    }
    if (!buttons.value.okToClick) {
        return;
    }
    if (!store.state.options.no_dblclick && !buttons.value.clickedNo) {
        buttons.value.clickedNo = true;
        return;
    }

    formData.value = {...startData};
    submitForm();
}

function report() {
    if (!confirm("By choosing this option, you will report the educators that this photo hurted or offended you for some reason. Do you confirm?")) {
        return;
    }
    formData.value = {...startData};
    formData.value.value = -2;
    submitForm();
}

function submitForm() {
    submitting.value = true;
    axios.post("?", {
        "action": "task",
        "type": "creender",
        "sub": "saveAnnotation",
        "id": nextPhoto.value,
        "data": formData.value,
        ...updateAxiosParams()
    })
        .then((response) => {
            if (response.data.result === "OK") {
                if (myModal) {
                    myModal.hide();
                }
                getNextPhoto();
            } else {
                showModalWindow(response.data.error);
            }
            console.log(response.data);
        })
        .catch((reason) => {
            let debugText = reason.response.statusText + " - " + reason.response.data.error;
            showModalWindow(debugText);
        })
        .then(() => {
            submitting.value = false;
            reset();
        });
}

function reset() {
    setTimeout(function () {
        buttons.value.okToClick = true;
    }, time);
    formData.value = {...startData};
    buttons.value.okToClick = false;
    buttons.value.clickedNo = false;
    buttons.value.clickedConfirm = false;
}

function getImageLink() {
    let params = {
        "action": "task",
        "type": "creender",
        "sub": "getPhoto",
        "id": nextPhoto.value,
        ...updateAxiosParams()
    };
    const u = new URLSearchParams(params).toString();
    // console.log(process.env.VUE_APP_AXIOS_URL);
    // console.log(axios);
    // console.log(u);
    let r = Math.random();
    nextPhotoURL.value = `${process.env.VUE_APP_AXIOS_URL}?${u}&r=${r}`;
}

async function getNextPhoto() {
    await axios.get("?", {
        "params": {
            "action": "task",
            "type": "creender",
            "sub": "nextPhoto",
            ...updateAxiosParams()
        }
    })
        .then((response) => {
            if (response.data.next) {
                nextPhoto.value = response.data.next.row;
            } else {
                nextPhoto.value = null;
            }
            getImageLink();
        })
        .catch((reason) => {
            let debugText = reason.response.statusText + " - " + reason.response.data.error;
            showModalWindow(debugText);
        })
        .then(() => {
            photoLoading.value = false;
        });
}

onMounted(async function () {
    await getNextPhoto();
    reset();
});
</script>

<style scoped>
#btn-yes, #btn-no {
    font-size: 3em;
}

.c-pointer {
    cursor: pointer;
}

.btn-disabled, .btn-disabled:hover {
    background-color: #ddd;
}

#photo-form {
    margin-top: 20px;
}

</style>