import { clsx } from 'clsx'
import * as React from 'react'

import styles from './root.module.scss'

import { Directory } from '../directory/directory'
import { Scanner } from '../scanner/scanner'
import { SettingsContext, useSettings } from '../settings/settings'

interface IRootProps {
    className?: string
}

export const Root: React.FC<IRootProps> = () => {
    const [blocks, setBlocks] = React.useState(0)
    const settings = useSettings()

    const changeBlock = React.useCallback((delta: number) => {
        setBlocks((b) => b + delta)
    }, [])

    return (
        <SettingsContext.Provider value={settings}>
            <div className={clsx(styles.root, blocks > 0 && styles.blocked)}>
                <Directory changeBlock={changeBlock} />
                <Scanner changeBlock={changeBlock} />
            </div>
        </SettingsContext.Provider>
    )
}
