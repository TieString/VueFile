/* 全局方法 */
import SparkMD5 from 'spark-md5'

/**
 * @description 下载文件
 * @author TieString
 * @date 2022/12/22
 * @param {*} data 文件内容
 * @param {*} fileName 文件名称
 */
export function downloadFile(data, fileName) {
    let a = document.createElement('a')
    a.href = window.URL.createObjectURL(new Blob([data]))
    a.download = fileName
    a.click()
    a.remove()
}

/**
 * @description 从文件路径获取名称，带后缀
 * @author TieString
 * @date 2022/12/22
 * @param {*} path 文件路径
 * @returns {string} 文件名称
 */
export function getFileName(path) {
    return path.split('/').pop()
}

export function getFileInfo(file) {
    return new Promise((resolve, reject) => {
        let fileReader = new FileReader()
        fileReader.readAsArrayBuffer(file)
        fileReader.onload = e => {
            let buffer = e.target.result
            let spark = new SparkMD5.ArrayBuffer()
            spark.append(buffer)
            let hash = spark.end()
            resolve({ hash, type: file.type, name: file.name })
        }
    })
}

/**
 * @description 文件切片
 * @author TieString
 * @date 2022/12/23
 * @param {*} file 文件
 * @param {*} size 切片大小
 * @returns {*}
 */
export async function getFileChunks(file, size) {
    let { hash, type } = await getFileInfo(file)
    let chunks = []
    let count = Math.ceil(file.size / size)
    let index = 0
    while (index < count) {
        chunks.push({
            file: file.slice(index * size, (index + 1) * size),
            hash,
            name: index,
            type
        })
        index++
    }
    return chunks
}

export async function getFileCon(url) {
    let config = {
        url,
        responseType: 'arraybuffer'
    }

    await this.axios.request(config).then(response => {
        return response.data
    })
}

/**
 * @description 设置cookie
 * @author TieString
 * @date 2022/12/27
 * @param {*} name 名称
 * @param {*} value 值
 * @param {*} options 可选设置
 */
export function setCookie(name, value, { expires }) {
    expires =
        typeof expires === 'number' && expires
            ? new Date().setTime(new Date().getTime() + expires * 1000)
            : ''

    value = encodeURIComponent(value)

    let updatedCookie = `${name}=${value}; Max-Age=${expires}`

    document.cookie = updatedCookie
}

export function getCookie(name) {
    let value = '; ' + document.cookie
    let parts = value.split('; ' + name + '=')
    if (parts.length === 2) {
        return parts
            .pop()
            .split(';')
            .shift()
    }
}

export function deleteCookie(name) {
    setCookie(name, '', {
        expires: -1
    })
}

export function checkTasks() {
    let results = []
    const cookies = document.cookie.split('; ')
    cookies.forEach(cookie => {
        cookie = cookie.split('=')
        if (cookie.length === 2) {
            const content = cookie[1]
            if (content === 'uploading') {
                results.push(cookie[0])
            }
        }
    })
    return results
}
