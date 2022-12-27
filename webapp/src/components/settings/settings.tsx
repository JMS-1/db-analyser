import { IConfigRequest, IConfigResponse } from 'ipc'
import * as React from 'react'

import { electronHost } from '../../electron'

interface IConfigurationData {
    rootPath: string
}

export interface IConfiguration extends IConfigurationData {
    update<TKey extends keyof IConfigurationData>(key: TKey, value: IConfigurationData[TKey]): void
}

const initialConfig: IConfigurationData = {
    rootPath: '',
}

export function useSettings(): Readonly<IConfiguration> {
    const [settings, setSettings] = React.useState<IConfigurationData>(initialConfig)

    function loadConfig(res: IConfigResponse): void {
        setSettings(JSON.parse(localStorage.getItem(res.configName) || JSON.stringify(initialConfig)))
    }

    React.useEffect(() => {
        electronHost.addListener('config-response', loadConfig)

        return () => electronHost.removeListener('config-response', loadConfig)
    }, [])

    React.useEffect(() => electronHost.send<IConfigRequest>({ type: 'config-request' }), [])

    return React.useMemo((): IConfiguration => {
        return {
            ...settings,
            update<TKey extends keyof IConfigurationData>(key: TKey, value: IConfigurationData[TKey]) {
                setSettings({ ...settings, [key]: value })
            },
        }
    }, [settings])
}
