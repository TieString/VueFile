/* 全局方法 */
export function downloadFile(data, fileName) {
    let a = document.createElement('a')
    a.href = window.URL.createObjectURL(new Blob([data]))
    a.download = fileName
    a.click()
    a.remove()
}

export function getFileName(path) {
   
    return path.split('/').pop()
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