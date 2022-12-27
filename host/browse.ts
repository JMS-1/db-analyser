import { BrowserWindow, dialog } from 'electron'
import { IBrowseFolderResponse, IBrowserFolderRequest, TResponse } from 'ipc'

export async function browseFolder(
    _win: BrowserWindow,
    request: IBrowserFolderRequest,
    reply: <T extends TResponse>(response: T) => void
): Promise<void> {
    const info = await dialog.showOpenDialog({
        buttonLabel: request.buttonLabel,
        defaultPath: request.defaultPath,
        properties: ['openDirectory'],
        title: request.title,
    })

    reply<IBrowseFolderResponse>({
        folder: (!info.canceled && info.filePaths?.[0]) || '',
        type: 'folder-response',
    })
}
