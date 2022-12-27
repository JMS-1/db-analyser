import { parse } from 'csv-parse'
import { createReadStream } from 'fs'

const germanDate = /^(\d{2})\.(\d{2})\.(\d{2,4})$/
const englishDate = /^(\d{2})\/(\d{2})\/(\d{2,4})$/

export interface IBuchung {
    amount: number
    date: string
    what: string
}

export class CsvFile {
    readonly buchungen: IBuchung[] = []

    private _analysed = false

    constructor(public readonly name: string, private readonly _path: string) {}

    analyse(done: () => void): void {
        if (this._analysed) {
            return
        }

        this._analysed = true

        const lines: string[][] = []

        try {
            const csv = createReadStream(this._path, { autoClose: true, encoding: 'latin1' })

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const parser = parse({ delimiter: ';', relax_column_count: true })

            parser.on('error', (err) => alert(err.message))

            parser.on('readable', () => {
                for (;;) {
                    const record = parser.read()

                    if (!record) {
                        break
                    }

                    lines.push(record)
                }
            })

            parser.on('end', () => {
                const headerDe = lines.findIndex((l) => l[0] === 'Buchungstag')
                const isGerman = headerDe >= 0
                const headerIndex = isGerman ? headerDe : lines.findIndex((l) => l[0] === 'Booking date')

                if (headerIndex < 0) {
                    return
                }

                const header = lines[headerIndex]

                const whatIndex = header.findIndex((r) =>
                    isGerman ? r === 'Verwendungszweck' : r === 'Transactions Payment details'
                )

                const minusIndex = header.findIndex((r) => (isGerman ? r === 'Soll' : r === 'Debit'))

                const plusIndex = header.findIndex((r) => (isGerman ? r === 'Haben' : r === 'Credit'))

                const currenyIndex = header.findIndex((r) =>
                    isGerman ? r === 'Waehrung' || r === 'Währung' : r === 'Currency'
                )

                if (whatIndex < 0 || minusIndex < 0 || plusIndex < 0 || currenyIndex < 0) {
                    return
                }

                const regex = isGerman ? germanDate : englishDate

                for (let index = headerIndex; ++index < lines.length; ) {
                    const line = lines[index]
                    const match = regex.exec(line[0])

                    if (!match) {
                        break
                    }

                    const day = parseInt(match[isGerman ? 1 : 2])
                    const month = parseInt(match[isGerman ? 2 : 1])
                    const year = parseInt(match[3])

                    const date = new Date(year < 2000 ? 2000 + year : year, month - 1, day)
                    const what = line[whatIndex]
                    const plus = line[plusIndex]
                    const minus = line[minusIndex]
                    const currency = line[currenyIndex]

                    if (currency !== 'EUR') {
                        continue
                    }

                    if (!plus === !minus) {
                        continue
                    }

                    this.buchungen.push({
                        amount: parseFloat(
                            (plus || minus).replace(isGerman ? /\./g : /,/g, '').replace(isGerman ? /,/g : /\./g, '.')
                        ),
                        date: `${date.getFullYear()}/${`${1 + date.getMonth()}`.padStart(
                            2,
                            '0'
                        )}/${`${date.getDate()}`.padStart(2, '0')}`,
                        what,
                    })
                }

                done()
            })

            csv.pipe(parser)
        } catch (error) {
            done()
        }
    }
}
