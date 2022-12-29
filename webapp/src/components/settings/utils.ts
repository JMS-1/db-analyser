export function exportToJson<T>(content: T, name: string): void {
    const download = document.createElement('a') as HTMLAnchorElement

    download.setAttribute(
        'href',
        `data:application/json;charset=utf-8;base64,${Buffer.from(JSON.stringify(content, null, 2)).toString('base64')}`
    )

    download.setAttribute('download', `${name}.json`)

    download.style.display = 'none'

    document.body.appendChild(download)

    download.click()

    document.body.removeChild(download)
}
