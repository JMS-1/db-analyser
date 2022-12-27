import * as React from 'react'

import styles from './root.module.scss'

import { useSettings } from '../settings/settings'

interface IRootProps {
    className?: string
}

export const Root: React.FC<IRootProps> = () => {
    const settings = useSettings()

    return (
        <div className={styles.root}>
            <pre>{JSON.stringify(settings, null, 2)}</pre>
            <button onClick={() => settings.update('rootPath', new Date().toISOString())}>doit</button>
        </div>
    )
}
