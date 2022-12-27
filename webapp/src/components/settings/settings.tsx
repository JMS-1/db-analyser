import { IConfigRequest, IConfigResponse } from 'ipc'
import * as React from 'react'

import { electronHost } from '../../electron'

interface IConfigurationData {
    rootPath: string
}

export interface IConfiguration extends IConfigurationData {
    update<TKey extends keyof IConfigurationData>(key: TKey, value: IConfigurationData[TKey]): void
}

const initialConfig: IConfiguration = {
    rootPath: '',
    update: () => alert('out of bound call to settings updater'),
}

export function useSettings(): Readonly<IConfiguration> {
    const [settings, setSettings] = React.useState<IConfigurationData>(initialConfig)
    const [config, setConfig] = React.useState('')

    function loadConfig(res: IConfigResponse): void {
        setConfig(res.configName)
        setSettings(JSON.parse(localStorage.getItem(res.configName) || JSON.stringify(initialConfig)))
    }

    React.useEffect(() => {
        electronHost.addListener('config-response', loadConfig)

        return () => electronHost.removeListener('config-response', loadConfig)
    }, [])

    React.useEffect(() => electronHost.send<IConfigRequest>({ type: 'config-request' }), [])

    return React.useMemo(
        () => ({
            ...settings,
            update: <TKey extends keyof IConfigurationData>(key: TKey, value: IConfigurationData[TKey]) => {
                const newSettings = { ...settings, [key]: value }

                setSettings(newSettings)

                if (config) {
                    localStorage.setItem(config, JSON.stringify(newSettings))
                }
            },
        }),
        [config, settings]
    )
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SettingsContext = React.createContext<IConfiguration>(initialConfig)
