/**
 * 打开数据库
 * @param {object} dbName 数据库的名字
 * @param {string} storeName 仓库名称
 * @param {string} version 数据库的版本
 * @return {object} 该函数会返回一个数据库实例
 */
export function openIndexedDB(dbName, version = 1) {
    return new Promise((resolve, reject) => {
        const indexedDB =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB
        const request = indexedDB.open('multipartyUpload', 1)

        request.onerror = function(event) {
            console.error('Error opening database')
        }

        request.onupgradeneeded = function(event) {
            const db = event.target.result
            db.createObjectStore('multipartyUpload', {
                keyPath: 'hash'
            })
        }

        request.onsuccess = function(event) {
            const db = event.target.result
            resolve(db)
        }
    })
}

/**
 * 新增数据
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {string} data 数据
 */
export function addData(db, storeName, data) {
    const transaction = db.transaction([storeName], 'readwrite')
    const objectStore = transaction.objectStore(storeName)

    let request = objectStore.add(data)

    request.onsuccess = function(event) {
        console.log('数据写入成功')
    }

    request.onerror = function(event) {
        console.log('数据写入失败')
    }
}

/**
 * 通过主键删除数据
 * @param {object} db 数据库实例
 * @param {string} storeName 仓库名称
 * @param {object} id 主键值
 */
export function deleteData(db, storeName, id) {
    const transaction = db.transaction([storeName], 'readwrite')
    const objectStore = transaction.objectStore(storeName)

    let request = objectStore.delete(id)

    request.onsuccess = function() {
        console.log('数据删除成功')
    }

    request.onerror = function() {
        console.log('数据删除失败')
    }
}
