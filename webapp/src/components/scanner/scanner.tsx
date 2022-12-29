import { clsx } from 'clsx'
import { readdir } from 'fs'
import { join } from 'path'
import * as React from 'react'

import { CsvFile, IBuchung } from './file'
import { Fileset } from './fileset'
import styles from './scanner.module.scss'

import { strings } from '../../strings'
import { Rules } from '../rules/rules'
import { SettingsContext } from '../settings/settings'
import { exportContent } from '../settings/utils'

interface IScannerProps {
    className?: string
    changeBlock(delta: number): void
}

export const Scanner: React.FC<IScannerProps> = (props) => {
    const { changeBlock } = props

    const { rootPath, categories } = React.useContext(SettingsContext)

    const [analysed, setAnalysed] = React.useState(false)
    const [groups, setGroups] = React.useState<[string, IBuchung[]][]>([])
    const [names, setNames] = React.useState<string[]>([])

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
    }, [changeBlock, rootPath, categories])

    React.useEffect(() => setAnalysed(false), [names])

    const files = React.useMemo(
        () => [...names].sort().map((f) => new CsvFile(f, join(rootPath, f))),
        [names, rootPath]
    )

    const analyse = React.useCallback(() => {
        setGroups([])
        setAnalysed(true)
    }, [])

    const unAnalyse = React.useCallback(() => setAnalysed(false), [])

    const createCsv = React.useCallback(() => {
        const lines = groups
            .filter((g) => g[0])
            .flatMap((g) =>
                g[1].map(
                    (e) =>
                        `${g[0]}\t${e.date.substring(8, 10)}.${e.date.substring(5, 7)}.${e.date.substring(
                            0,
                            4
                        )}\t${e.amount.toFixed(2).replace(/\./g, ',')}\t${e.what}`
                )
            )

        lines.unshift('Gruppe\tDatum\tBetrag\tBuchung')

        exportContent('text/csv', lines.join('\n'), 'Konto.csv')
    }, [groups])

    return (
        <div className={clsx(styles.scanner, props.className)}>
            <div className={styles.headline}>
                <div>{strings.count(files.length)}</div>
                <Rules onAnalyse={unAnalyse} />
                <button disabled={analysed || files.length < 1} onClick={analyse}>
                    {strings.analyse}
                </button>
                <button disabled={files.length < 1 || !analysed} onClick={createCsv}>
                    {strings.saveAs}
                </button>
            </div>
            <div className={styles.list}>{analysed && <Fileset files={files} onGroups={setGroups} />}</div>
        </div>
    )
}
