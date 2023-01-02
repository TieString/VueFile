<template>
    <v-card class="mx-auto outer-container" max-width="245" outlined>
        <div class="fileInfo">
            <v-card-title class="pa-0" :title="fileInfo.file.name">
                <span class="fileName"><strong>{{ fileInfo.file.name }}</strong></span>
            </v-card-title>

            <v-card-subtitle class="pa-0 pt-2" :title="fileInfo.hash">
                <span class="fileHash"> {{ fileInfo.hash }} </span>
            </v-card-subtitle>
        </div>

        <div class="fileProgress">
            <v-progress-linear v-model="totalProgress" height="18" background-opacity=0.1 rounded>
                {{ Math.ceil(totalProgress) }}%
            </v-progress-linear>
        </div>
        <v-card-actions class="pa-0 pt-1 pb-1">
            <v-btn color="red" text @click="cancle">取消</v-btn>
            <v-btn color="green" text class="ml-10" @click="upload" v-if="!isPaused">{{ isUploading ? '继续' : '开始'
}}</v-btn>
            <v-btn color="red" text @click="pause" class="ml-10" v-else>暂停</v-btn>
            <v-btn icon @click="showMore = !showMore">
                <v-icon>{{ showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </v-card-actions>

        <v-expand-transition>
            <div v-show="showMore" style="max-height: 255px; overflow: scroll; overflow-x: hidden;">
                <v-progress-linear v-for="index of chunkProgresses.length" :key="index" v-model="chunkProgresses[index]"
                    background-opacity=0.1 height="18" rounded class="mb-2">
                    {{ Math.ceil(chunkProgresses[index]) }}%
                </v-progress-linear>
            </div>
        </v-expand-transition>
    </v-card>
</template>
<script>
import { getFileChunks, getFileInfo } from '../js/file'

const chunckSize = Math.pow(1024, 2)

export default {
    props: {
        fileInfo: { type: Object, default: null },
        axios: Function
    },
    data() {
        return {
            showMore: false,
            isPaused: false,
            isUploading: false,
            totalProgress: 0,
            chunkProgresses: []
        }
    },
    methods: {
        async upload() {
            this.isUploding = true
            this.isPaused = !this.isPaused
            /* 断点续传 */
            let url = '/storage/{storage}/multipartyUpload?path={path}'
                .replace(new RegExp('{storage}', 'g'), 'local')
                .replace(new RegExp('{path}', 'g'), '/')

            let chunks = await getFileChunks(this.fileInfo.file, chunckSize)
            this.fileInfo.progressCount = chunks.length - 1 // 进度条的数量
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
                        this.chunkProgresses[index] =
                            (progressEvent.loaded / progressEvent.total) * 100
                        if (progressEvent.loaded === progressEvent.total) {
                            let finishedProgressCount = 0
                            for (const progress of this.chunkProgresses) {
                                if (progress === 100) finishedProgressCount++
                            }
                            this.totalProgress = (finishedProgressCount / chunks.length) * 100
                        }
                    },
                    params: {
                        hash: chunk.hash,
                        name: chunk.name,
                        type: chunk.type
                    }
                }
                this.axios.request(config)
            })
            // 开始合并
            if (sendChunkCount === chunks.length) {
                const url = '/storage/{storage}/merge?path={path}'
                    .replace(new RegExp('{storage}', 'g'), 'local')
                    .replace(new RegExp('{path}', 'g'), '/')
                let { hash, type, name } = await getFileInfo(this.fileInfo.file)
                this.axios.request({
                    url: url,
                    method: 'get',
                    params: { hash, type, name, chunksCount: chunks.length }
                }).then(result => {
                    // deleteData(database, 'multipartyUpload', hash)
                })
            }
        },
        pause() {
            this.isPaused = !this.isPaused
        },
        cancle() {

        }
    },
    async mounted() {
        let chunks = await getFileChunks(this.fileInfo.file, chunckSize)
        this.chunkProgresses.length = chunks.length
        for (let i = 0; i < this.chunkProgresses.length; i++) {
            this.chunkProgresses[i] = 0
        }
    }
}
</script>
<style lang="scss" scoped>
.outer-container {
    padding: 5px 20px;
    margin: 10px auto;

    .fileInfo {
        margin-bottom: 10px;

        .fileName,
        .fileHash {
            display: block;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        .fileHash {
            color: gray;
        }
    }
}
</style>
