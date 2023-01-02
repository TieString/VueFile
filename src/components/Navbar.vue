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
            <TaskProgress v-for="file of filesUploading" :key="file.hash" :fileInfo='file' :axios="axios">
            </TaskProgress>

        </v-navigation-drawer>
    </div>
</template>

<script>
import axios from 'axios'
import TaskProgress from './TaskProgress.vue'
import { openIndexedDB, getAllDataByStore } from '../js/indexedDB'

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
            filesUploading: null,
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
        }
    },
    mounted() {
        // setTimeout(() => {
        //     this.showmsg()
        // }, 800)
        /* 检测任务列表 */
        openIndexedDB('multipartyUpload').then(async (database) => {
            let files = await getAllDataByStore(database, 'multipartyUpload')
            this.filesUploading = files
        })
    }
}
</script>

<style>

</style>
