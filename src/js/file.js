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
