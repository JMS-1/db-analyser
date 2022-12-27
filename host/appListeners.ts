/* eslint-disable @typescript-eslint/naming-convention */

import { BrowserWindow } from 'electron'
import { TRequestType, TResponse, TTypedRequest } from 'ipc'

import { browseFolder } from './browse'
import { getConfigName } from './configName'

/** Signatur für eine Meldung vom Electron Host an die Anwendung. */
type TReply = (response: TResponse) => void

/** Signatur für die Bearbeitung einer Meldung von der Anwendung an den Electron Host. */
export type THandler<T extends TRequestType> = (
    app: BrowserWindow,
    request: TTypedRequest<T>,
    reply: TReply
) => void | Promise<void>

/** Handler für alle Nachrichten, die von der Anwendung an den Host gesendet werden können. */
export const listeners: { [T in TRequestType]: THandler<T> } = {
    'config-request': getConfigName,
    'folder-request': browseFolder,
}
