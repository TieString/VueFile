<template>
    <v-list class="outer-container">
        <div class="fileInfo">
            <span class="fileName"><strong>{{ fileInfo.filename }}</strong></span>
            <span class="fileHash">{{ fileInfo.hash }} </span>
        </div>
        <div class="fileProgress">
            <v-progress-linear v-model="fileInfo.progress" height="20" rounded>
                {{ Math.ceil(fileInfo.progress) }}%
            </v-progress-linear>
        </div>
    </v-list>
</template>
<script>
export default {
    props: {
        fileInfo: { type: Object, default: null }
    }
}
</script>
<style lang="scss" scoped>
.outer-container {
    border: 1px solid rgb(218, 218, 218);
    padding: 5px 20px;
    margin-top: 10px;

    .fileInfo{
        margin-bottom: 10px;

        .fileName{
            display: block;
        }
    }
}
</style>
