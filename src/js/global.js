/* 全局方法 */
export function downloadFile(data) {
    let blob = new Blob([data]) // 转换blob数据类型
    // 创建读取文件FileReader
    let reader = new FileReader()
    reader.readAsText(blob, 'utf-8')
    reader.onload = () => {
        // 捕获异常 无法解析JSON格式 这里返回的数据是文件流 可供下载
        let downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob)
        downloadElement.href = href
        downloadElement.download = 'pdfName'
        document.body.appendChild(downloadElement)
        downloadElement.click() // 点击下载

        // 释放处理
        document.body.removeChild(downloadElement)
        window.URL.revokeObjectURL(href)
    }
}
