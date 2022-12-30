<template>
    <v-card class="mx-auto outer-container" max-width="344">
        <div class="fileInfo">
            <v-card-title class="pa-0">
                <span class="fileName"><strong>{{ fileInfo.filename }}</strong></span>
            </v-card-title>

            <v-card-subtitle class="pa-0 pt-2">
                <span class="fileHash"> {{ fileInfo.hash }} </span>
            </v-card-subtitle>
        </div>

        <div class="fileProgress">
            <v-progress-linear v-model="fileInfo.progress" height="18" background-opacity=0.1 rounded>
                {{ Math.ceil(fileInfo.progress) }}%
            </v-progress-linear>
        </div>
        <v-card-actions class="pa-0 pt-1 pb-1">
            <v-btn text>暂停</v-btn>

            <v-btn color="purple" text class="ml-10">继续</v-btn>

            <v-spacer></v-spacer>

            <v-btn icon @click="showMore = !showMore">
                <v-icon>{{ showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </v-card-actions>

        <v-expand-transition>
            <div v-show="showMore" style="max-height: 255px; overflow: hidden;">
                <v-progress-linear v-for="index of fileInfo.chunksCount" :key="index" v-model="fileInfo.progress"
                    background-opacity=0.1 height="18" rounded class="mb-2">
                    {{ Math.ceil(fileInfo.progress) }}%
                </v-progress-linear>
            </div>
        </v-expand-transition>
    </v-card>
</template>
<script>
export default {
    props: {
        fileInfo: { type: Object, default: null }
    },
    data() {
        return {
            showMore: false
        }
    }
}
</script>
<style lang="scss" scoped>
.outer-container {
    padding: 5px 20px;
    margin-top: 10px;

    .fileInfo {
        margin-bottom: 10px;

        .fileName {
            display: block;
        }

        .fileHash {
            color: gray;
        }
    }
}
</style>
