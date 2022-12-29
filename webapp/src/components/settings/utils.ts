export function exportContent(contentType: string, content: string, name: string): void {
    const download = document.createElement('a') as HTMLAnchorElement

    download.setAttribute('href', `data:${contentType};charset=utf-8;base64,${Buffer.from(content).toString('base64')}`)

    download.setAttribute('download', name)

    download.style.display = 'none'

    document.body.appendChild(download)

    download.click()

    document.body.removeChild(download)
}
