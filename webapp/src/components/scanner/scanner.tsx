import { clsx } from 'clsx'
import { readdir } from 'fs'
import * as React from 'react'

import styles from './scanner.module.scss'

import { SettingsContext } from '../settings/settings'

interface IScannerProps {
    className?: string
    changeBlock(delta: number): void
}

export const Scanner: React.FC<IScannerProps> = (props) => {
    const { changeBlock } = props

    const settings = React.useContext(SettingsContext)
    const { rootPath } = settings

    const [files, setFiles] = React.useState<string[]>([])

    React.useEffect(() => {
        if (!rootPath) {
            return
        }

        changeBlock(-1)

        readdir(rootPath, { withFileTypes: true }, (err, files) => {
            changeBlock(+1)

            if (err) {
                return
            }

            setFiles(files.map((f) => `${f.name} ${f.isFile()}`))
        })
    }, [changeBlock, rootPath])

    return (
        <div className={clsx(styles.scanner, props.className)}>
            <pre>{JSON.stringify(files, null, 2)}</pre>
        </div>
    )
}
