import { IConfigRequest, IConfigResponse } from 'ipc'
import * as React from 'react'

import { exportContent } from './utils'

import { electronHost } from '../../electron'

interface IConfigurationData {
    categories: Record<string, string[]>
    rootPath: string
}

export interface IConfiguration extends IConfigurationData {
    update<TKey extends keyof IConfigurationData>(key: TKey, value: IConfigurationData[TKey]): void
    load(file: File): Promise<void>
    save(): void
}

const initialConfig: IConfiguration = {
    categories: {},
    load: async () => alert('out of bound call to settings import'),
    rootPath: '',
    save: () => alert('out of bound call to settings export'),
    update: () => alert('out of bound call to settings updater'),
}

export function useSettings(): Readonly<IConfiguration> {
    const [settings, setSettings] = React.useState<IConfigurationData>(initialConfig)
    const [config, setConfig] = React.useState('')

    function loadConfig(res: IConfigResponse): void {
        setConfig(res.configName)

        setSettings({
            ...initialConfig,
            ...JSON.parse(localStorage.getItem(res.configName) || JSON.stringify(initialConfig)),
        })
    }

    React.useEffect(() => {
        electronHost.addListener('config-response', loadConfig)

        return () => electronHost.removeListener('config-response', loadConfig)
    }, [])

    React.useEffect(() => electronHost.send<IConfigRequest>({ type: 'config-request' }), [])

    const writeSettings = React.useCallback(
        (settings: IConfigurationData) => {
            setSettings(settings)

            if (config) {
                localStorage.setItem(config, JSON.stringify(settings))
            }
        },
        [config]
    )

    const update = React.useCallback(
        <TKey extends keyof IConfigurationData>(key: TKey, value: IConfigurationData[TKey]) =>
            writeSettings({ ...settings, [key]: value }),
        [settings, writeSettings]
    )

    const save = React.useCallback(() => {
        const dataOnly: Partial<IConfiguration> = { ...settings }

        delete dataOnly.rootPath
        delete dataOnly.update
        delete dataOnly.save

        exportContent('application/json', JSON.stringify(dataOnly, null, 2), 'DB Analyser Configuration.json')
    }, [settings])

    const load = React.useCallback(
        async (file: File) => {
            try {
                const reader = new FileReader()

                reader.onload = () => {
                    const imported = JSON.parse(reader.result as string) as IConfigurationData

                    if (!imported) {
                        throw new Error('Failed to import.')
                    }

                    writeSettings({ ...settings, categories: imported.categories })
                }

                reader.readAsText(file)
            } catch (error) {
                alert(error.message)
            }
        },
        [settings, writeSettings]
    )

    return React.useMemo(() => ({ ...settings, load, save, update }), [load, save, settings, update])
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SettingsContext = React.createContext<IConfiguration>(initialConfig)
