<!-- 导航栏 -->
<template>
    <div>
        <v-app-bar dense flat fixed :clipped-left="$vuetify.breakpoint.lgAndUp" app color="light-grey lighten-4">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="mr-0"></v-app-bar-nav-icon>
            <v-toolbar-title>
                <v-btn text to="/">
                    <v-icon class="mr-2">mdi-folder-multiple-outline</v-icon>
                    <span class="title" @click="showmsg">地理与环境学院文件管理系统</span>
                </v-btn>
            </v-toolbar-title>
            <div class="flex-grow-1"></div>
            <div v-if="$vuetify.breakpoint.smAndUp">
                <v-btn icon href="https://www.npmjs.com/package/vuetify-file-browser" target="_blank">
                    <v-icon style="font-size: 32px" color="blue-grey darken-4">mdi-npm</v-icon>
                </v-btn>
                <v-btn icon href="https://github.com/semeniuk/vuetify-file-browser" target="_blank">
                    <v-icon style="font-size: 32px" color="blue-grey darken-4">mdi-github-circle</v-icon>
                </v-btn>
            </div>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" fixed app :clipped="$vuetify.breakpoint.lgAndUp">
            <TaskProgress v-for="file in filesUploading" :key="file" :fileInfo='filesUploading[file]'>
            </TaskProgress>

        </v-navigation-drawer>
    </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import TaskProgress from './TaskProgress.vue'
import { downloadFile, getFileChunks, getFileInfo } from '../js/file'
import { openIndexedDB, deleteData, getAllDataByStore } from '../js/indexedDB'

export default {
    components: {
        TaskProgress
    },
    props: {
        axiosConfig: { type: Object, default: () => { } }
    },
    data() {
        return {
            drawer: null,
            filesUploading: Vue.prototype.$taskList,
            ps: Vue.prototype.$ps,
            axios: null,
            progress: 0
        }
    },
    created() {
        this.activeStorage = 'local'
        this.axios = axios.create(this.axiosConfig)
    },
    methods: {
        showmsg() {
            console.log(this.$taskList)
            Vue.prototype.$taskList['test'] = 'test'
        }
    },
    mounted() {
        setTimeout(() => {
            this.showmsg()
        }, 800)
        /* 断点续传 */
        openIndexedDB('multipartyUpload').then(async (database) => {
            let files = await getAllDataByStore(database, 'multipartyUpload')
            for (let file of files) {
                let url = '/storage/{storage}/multipartyUpload?path={path}'
                    .replace(new RegExp('{storage}', 'g'), 'local')
                    .replace(new RegExp('{path}', 'g'), '/')

                let chunks = await getFileChunks(file.file, Math.pow(1024, 2))
                let sendChunkCount = 0
                await chunks.forEach((chunk, index) => {
                    sendChunkCount++
                    let formData = new FormData()
                    formData.append('file', chunk.file)
                    let config = {
                        url,
                        method: 'post',
                        data: formData,
                        onUploadProgress: progressEvent => {
                            this.progress =
                                (progressEvent.loaded / progressEvent.total) * 100
                        },
                        params: {
                            hash: chunk.hash,
                            name: chunk.name,
                            type: chunk.type
                        }
                    }
                    this.axios.request(config)
                    // 开始合并
                })
                if (sendChunkCount === chunks.length) {
                    const url = '/storage/{storage}/merge?path={path}'
                        .replace(new RegExp('{storage}', 'g'), 'local')
                        .replace(new RegExp('{path}', 'g'), '/')
                    let { hash, type, name } = await getFileInfo(file.file)
                    this.axios.request({
                        url: url,
                        method: 'get',
                        params: { hash, type, name, chunksCount: chunks.length }
                    }).then(result => {
                        // deleteData(database, 'multipartyUpload', hash)
                    })
                }
            }
        })
    }
}
</script>

<style>

</style>
