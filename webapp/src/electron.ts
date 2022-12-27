import { TRequest, TResponseType, TTypedResponse } from 'ipc'

/** Im Standalone Modus gibt es kein require - bei Electron Hosting schon. */
const ipcRenderer = window.require?.('electron').ipcRenderer

type TCallback<TType extends TResponseType> = <T extends TTypedResponse<TType>>(response: T) => void

/** Kleine Hilfsklasse zur einfachen Kommunikation mit dem Electron Host - sofern ein solcher existiert. */
export const electronHost = new (class {
    /** Alle Host Nachrichten, auf die in der Anwendung reagiert werden soll. */
    private readonly _listeners: { [T in TResponseType]?: TCallback<T>[] } = {}

    constructor() {
        /** Verteilt Nachrichten vom Electron Host. */
        ipcRenderer?.on('hostToApp', <T extends TResponseType>(_ev: unknown, response: TTypedResponse<T>): void => {
            /** Natürlich nur, wenn es sich um eine bekannte Nachricht handelt. */
            const list = (this._listeners[response.type] || []) as TCallback<T>[]

            /** Pro Nachrichtenkarten kann es natürlich mehrere Anmeldungen geben. */
            list.forEach((p) => p(response))
        })
    }

    /**
     * Übermittelt eine Nachricht an den Electron Host.
     *
     * @param request Die Aufrufparameter.
     */
    send<T extends TRequest>(request: T): void {
        ipcRenderer?.send('appToHost', request)
    }

    /**
     * Registriert eine Art von Nachricht zur Auswertung.
     *
     * @param type Die Art der Nachricht.
     * @param listener Die Methode zur Auswertung der Nachricht.
     */
    addListener<T extends TResponseType>(type: T, listener: TCallback<T>): void {
        let list = this._listeners[type]

        if (!list) {
            this._listeners[type] = list = []
        }

        list.push(listener)
    }

    /**
     * Deregistriert eine Art von Nachricht zur Auswertung.
     *
     * @param type Die Art der Nachricht.
     * @param listener Die Methode zur Auswertung der Nachricht.
     */
    removeListener<T extends TResponseType>(type: T, listener: TCallback<T>): void {
        const list = this._listeners[type] as TCallback<T>[]

        if (!list) {
            return
        }

        /** Beim Entfernen wird exakte Gleichkeit vorausgesetzt. */
        const index = list.findIndex((p) => p === listener)

        if (index >= 0) {
            list.splice(index, 1)
        }
    }
})()
