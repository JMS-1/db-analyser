import { clsx } from 'clsx'
import { IBrowseFolderResponse, IBrowserFolderRequest } from 'ipc'
import * as React from 'react'

import styles from './directory.module.scss'

import { electronHost } from '../../electron'
import { strings } from '../../strings'
import { SettingsContext } from '../settings/settings'

interface IDirectoryProps {
    changeBlock(delta: number): void
    className?: string
}

export const Directory: React.FC<IDirectoryProps> = (props) => {
    const { changeBlock } = props

    const settings = React.useContext(SettingsContext)

    function setPath(ev: React.ChangeEvent<HTMLInputElement>): void {
        settings.update('rootPath', ev.target.value)
    }

    function browsePath(): void {
        changeBlock(+1)

        electronHost.send<IBrowserFolderRequest>({
            buttonLabel: strings.select,
            defaultPath: settings.rootPath,
            title: strings.browse,
            type: 'folder-request',
        })
    }

    const selectPath = React.useCallback(
        (res: IBrowseFolderResponse) => {
            changeBlock(-1)

            if (!res.folder) {
                return
            }

            settings.update('rootPath', res.folder)
        },
        [changeBlock, settings]
    )

    React.useEffect(() => {
        electronHost.addListener('folder-response', selectPath)

        return () => electronHost.removeListener('folder-response', selectPath)
    }, [selectPath])

    return (
        <label className={clsx(styles.directory, props.className)}>
            <span>{strings.directory}</span>
            <input type='text' value={settings.rootPath} onChange={setPath} />
            <button onClick={browsePath}>...</button>
        </label>
    )
}
