const path = require('path')
module.exports = {
    devServer: {
        hot: true,
        open: true,
        port: 8080,
        host: '127.0.0.1'
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src/'),
                'vuetify-file-browser':
                    process.env.NODE_ENV === 'development'
                        ? path.resolve(__dirname, '../component')
                        : 'vuetify-file-browser'
            }
        },
        module: {
            rules: [
                {
                    test: /\.(js|vue)$/,
                    loader: 'string-replace-loader',
                    options: {
                        search: '__AXIOS_BASE_URL__',
                        replace:
                            process.env.NODE_ENV === 'development'
                                ? 'http://localhost:10086' // ? 'https://2ccb2237.r5.cpolar.top' 接口端口
                                : 'https://vuetify-file-browser-server.herokuapp.com',
                        flags: 'g'
                    }
                }
            ]
        }
    }
}
