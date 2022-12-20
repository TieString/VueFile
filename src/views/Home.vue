<template>
    <div>
        <h1 class="text-center font-weight-light my-5">文件管理</h1>
        <v-row>
            <v-col>
                <file-browser
                    :axiosConfig="{baseURL: '__AXIOS_BASE_URL__'}"
                    :maxUploadFileSize="5242880 * 10000"
                    :maxUploadFilesCount="5"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script>
import FileBrowser from "../components/FileBrowser";

export default {
    components: {
        FileBrowser
    }
};
</script>
