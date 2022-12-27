import { BrowserWindow } from 'electron'
import { IConfigRequest, IConfigResponse, TResponse } from 'ipc'

import { isProduction } from './window'

export async function getConfigName(
    _win: BrowserWindow,
    _request: IConfigRequest,
    reply: <T extends TResponse>(response: T) => void
): Promise<void> {
    reply<IConfigResponse>({
        configName: isProduction ? 'db-analyser-v1' : 'db-analyser-develop',
        type: 'config-response',
    })
}
