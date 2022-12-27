<!-- 上传 -->
<template>
    <v-overlay :absolute="true">
        <v-card flat light class="mx-auto" :loading="loading">
            <v-card-text class="py-3 text-center">
                <div>
                    <span class="grey--text">路径：</span>
                    <v-chip color="info" class="mx-1">{{ storage }}</v-chip>
                    <v-chip>{{ path }}</v-chip>
                </div>
                <div v-if="maxUploadFilesCount || maxUploadFileSize">
                    <span class="grey--text">数量限制：{{ maxUploadFilesCount }}</span>
                    &nbsp;&nbsp;
                    <span class="grey--text">体积限制：{{ formatBytes(maxUploadFileSize) }}</span>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text v-if="listItems.length" class="pa-0 files-list-wrapper">
                <v-list two-line v-if="listItems.length">
                    <v-list-item v-for="(file, index) in listItems" :key="index" link>
                        <v-list-item-avatar>
                            <v-img v-if="file.preview" :src="file.preview"></v-img>
                            <v-icon v-else v-text="icons[file.extension] || 'mdi-file'" class="mdi-36px"
                                color="grey lighten-1"></v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title v-text="file.name"></v-list-item-title>
                            <v-list-item-subtitle>{{ formatBytes(file.size) }} -
                                {{ file.type }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon @click="remove(index)">
                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-text v-else class="py-6 text-center">
                <v-btn @click="$refs.inputUpload.click()">
                    <v-icon left>mdi-plus-circle</v-icon>添加文件
                </v-btn>
            </v-card-text>
            <v-divider></v-divider>
            <v-toolbar dense flat>
                <div class="grow"></div>
                <v-btn text @click="cancel" class="mx-1">取消</v-btn>
                <v-btn depressed color="warning" @click="clear" class="mx-1" :disabled="!files">
                    <v-icon>mdi-close</v-icon>清空
                </v-btn>
                <v-btn :disabled="listItems.length >= maxUploadFilesCount" depressed color="info"
                    @click="$refs.inputUpload.click()" class="mx-1">
                    <v-icon left>mdi-plus-circle</v-icon>添加
                    <input v-show="false" ref="inputUpload" type="file" multiple @change="add" />
                </v-btn>
                <v-btn depressed color="success" @click="multipartyUpload" class="ml-1" :disabled="!files">
                    上传
                    <v-icon right>mdi-upload-outline</v-icon>
                </v-btn>
            </v-toolbar>
            <v-overlay :value="uploading" :absolute="true" color="white" opacity="0.9">
                <v-progress-linear v-model="progress" height="25" striped rounded reactiv>
                    <strong>{{ Math.ceil(progress) }}%</strong>
                </v-progress-linear>
                <v-btn depressed color="error" @click="cancelMultipartyUpload" class="mx-1">
                    取消
                </v-btn>
                <v-btn depressed color="success" @click="pauseUpload" class="mx-1">
                    暂停
                </v-btn>
            </v-overlay>
        </v-card>
    </v-overlay>
</template>

<script>
import { formatBytes } from '../plugins/util'
import axios from 'axios'
import { getFileChunks, getFileInfo, setCookie, deleteCookie } from '../js/file'
import { openIndexedDB, addData, deleteData } from '../js/indexedDB'

const imageMimeTypes = ['image/png', 'image/jpeg']
let multipartyUploadDB = openIndexedDB('multipartyUpload').then((params) => {
    multipartyUploadDB = params
})
export default {
    props: {
        path: String,
        storage: String,
        endpoint: Object,
        files: { type: Array, default: () => [] },
        icons: Object,
        axios: Function,
        maxUploadFilesCount: { type: Number, default: 0 },
        maxUploadFileSize: { type: Number, default: 0 }
    },
    data() {
        return {
            loading: false,
            uploading: false,
            progress: 0,
            listItems: [],
            uploadCancelToken: axios.CancelToken,
            uploadCancelHandleList: []
        }
    },
    methods: {
        formatBytes,

        async filesMap(files) {
            let promises = Array.from(files).map(file => {
                let result = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    extension: file.name.split('.').pop()
                }
                return new Promise(resolve => {
                    if (!imageMimeTypes.includes(result.type)) {
                        return resolve(result)
                    }
                    var reader = new FileReader()
                    reader.onload = function (e) {
                        result.preview = e.target.result
                        resolve(result)
                    }
                    reader.readAsDataURL(file)
                })
            })

            // eslint-disable-next-line no-return-await
            return await Promise.all(promises)
        },

        async add(event) {
            let files = Array.from(event.target.files)
            this.$emit('add-files', files)
            this.$refs.inputUpload.value = ''
        },

        remove(index) {
            this.$emit('remove-file', index)
            this.listItems.splice(index, 1)
        },

        clear() {
            this.$emit('clear-files')
            this.listItems = []
        },

        cancel() {
            this.$emit('cancel')
        },

        async upload() {
            let formData = new FormData()

            // 文件
            for (let file of this.files) {
                formData.append('files', file, file.name)
            }

            let url = this.endpoint.url
                .replace(new RegExp('{storage}', 'g'), this.storage)
                .replace(new RegExp('{path}', 'g'), this.path)

            let config = {
                url,
                method: this.endpoint.method || 'post',
                data: formData,
                onUploadProgress: progressEvent => {
                    this.progress =
                        (progressEvent.loaded / progressEvent.total) * 100
                },
                cancelToken: this.uploadCancelToken.source().token
            }

            this.uploading = true
            await this.axios.request(config)
            this.uploading = false
            this.$emit('uploaded')
        },
        /* 取消上传 */
        cancelUpload() {
            this.uploadCancelToken.source.cancel()
            this.uploading = false
        },
        /* 暂停上传 */
        pauseUpload() {

        },
        /* 分片上传 */
        async multipartyUpload() {
            // 文件上传
            for (let file of this.files) {
                this.uploading = true

                let url = '/storage/{storage}/multipartyUpload?path={path}'
                    .replace(new RegExp('{storage}', 'g'), this.storage)
                    .replace(new RegExp('{path}', 'g'), this.path)

                let result = []
                let chunks = await getFileChunks(file, Math.pow(1024, 2))
                setCookie(chunks[0].hash, 'uploading', { expires: 60 * 2 })
                addData(multipartyUploadDB, 'multipartyUpload', { hash: chunks[0].hash, file })
                let sendChunkCount = 0
                await chunks.forEach(chunk => {
                    sendChunkCount++
                    let formData = new FormData()
                    formData.append('file', chunk.file)
                    let config = {
                        url,
                        method: this.endpoint.method || 'post',
                        data: formData,
                        onUploadProgress: progressEvent => {
                            this.progress =
                                (progressEvent.loaded / progressEvent.total) * 100
                        },
                        cancelToken: new axios.CancelToken(c => {
                            this.uploadCancelHandleList.push(c)
                        }),

                        params: {
                            hash: chunk.hash,
                            name: chunk.name,
                            type: chunk.type
                        }
                    }
                    this.axios.request(config).then(async res => {
                        if (res.data.code === 0) { // 文件存在
                            this.uploading = false
                            this.$emit('uploaded')
                            this.cancelMultipartyUpload()
                            return
                        }
                        Number((((chunk.name + 1) / chunks.length) * 100).toFixed(2))
                        result.push(res.data)
                    }).catch(err => {
                        result = { err }
                    })
                    // 开始合并
                    if (sendChunkCount === chunks.length) this.multipartyFileMerge(file, chunks.length)
                })
            }
        },
        /* 合并文件 */
        async multipartyFileMerge(file, chunksCount) {
            const url = '/storage/{storage}/merge?path={path}'
                .replace(new RegExp('{storage}', 'g'), this.storage)
                .replace(new RegExp('{path}', 'g'), this.path)
            let { hash, type, name } = await getFileInfo(file)
            this.axios.request({
                url: url,
                method: 'get',
                params: { hash, type, name, chunksCount }
            }).then(result => {
                // 合并完成
                // result = [result.data, ...result]
                deleteCookie(hash)
                deleteData(multipartyUploadDB, 'multipartyUpload', hash)
                this.uploading = false
                this.$emit('uploaded')
            })
        },
        /* 取消分片上传 依次取消所有任务 */
        cancelMultipartyUpload() {
            this.uploadCancelHandleList.forEach(fn => fn())
            this.uploading = false
            this.$emit('uploaded')
        }
    },
    watch: {
        files: {
            deep: true,
            immediate: true,
            async handler() {
                this.loading = true
                this.listItems = await this.filesMap(this.files)
                this.loading = false
            }
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .v-overlay__content {
    width: 90%;
    max-width: 500px;

    .files-list-wrapper {
        max-height: 250px;
        overflow-y: auto;
    }
}
</style>
