import { clsx } from 'clsx'
import { readdir } from 'fs'
import { join } from 'path'
import * as React from 'react'

import { CsvFile } from './file'
import { Fileset } from './fileset'
import styles from './scanner.module.scss'

import { strings } from '../../strings'
import { SettingsContext } from '../settings/settings'

interface IScannerProps {
    className?: string
    changeBlock(delta: number): void
}

export const Scanner: React.FC<IScannerProps> = (props) => {
    const { changeBlock } = props

    const settings = React.useContext(SettingsContext)
    const { rootPath } = settings

    const [names, setNames] = React.useState<string[]>([])
    const [analysed, setAnalysed] = React.useState(false)

    React.useEffect(() => {
        if (!rootPath) {
            return
        }

        setNames([])

        changeBlock(-1)

        readdir(rootPath, { withFileTypes: true }, (err, files) => {
            changeBlock(+1)

            if (err) {
                return
            }

            files.map((fileOrDir) => {
                if (fileOrDir.isFile() && fileOrDir.name.endsWith('.csv')) {
                    setNames((list) => [...list, fileOrDir.name])
                } else if (fileOrDir.isDirectory()) {
                    changeBlock(-1)

                    readdir(join(rootPath, fileOrDir.name), { withFileTypes: true }, (err, files) => {
                        changeBlock(+1)

                        if (err) {
                            return
                        }

                        files.map((file) => {
                            if (file.isFile() && file.name.endsWith('.csv')) {
                                setNames((list) => [...list, join(fileOrDir.name, file.name)])
                            }
                        })
                    })
                }
            })
        })
    }, [changeBlock, rootPath])

    React.useEffect(() => setAnalysed(false), [names])

    const files = React.useMemo(
        () => [...names].sort().map((f) => new CsvFile(f, join(rootPath, f))),
        [names, rootPath]
    )

    function analyse(): void {
        setAnalysed(true)
    }

    return (
        <div className={clsx(styles.scanner, props.className)}>
            <div className={styles.headline}>
                <div>{strings.count(files.length)}</div>
                <button disabled={analysed || files.length < 1} onClick={analyse}>
                    {strings.analyse}
                </button>
            </div>
            <div className={styles.list}>{analysed && <Fileset files={files} />}</div>
        </div>
    )
}
