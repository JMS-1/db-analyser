import { config } from 'dotenv'
import { app, BrowserWindow } from 'electron'
import { BrowserWindowConstructorOptions } from 'electron/main'
import { dirname, join } from 'path'

/** Konfiguration aus einer .env Datei einlesen. */
const appImage = app.isPackaged && (process.env.APPIMAGE || process.env.PORTABLE_EXECUTABLE_FILE)

config(appImage ? { path: join(dirname(appImage), '.env') } : undefined)

/** Man beachte, dass diese Environmentvariable vor dem Aufruf des Electron Hosts explizit gesetzt werden muss. */
export const isProduction = process.env.NODE_ENV === 'production' || app.isPackaged

export function createWindow(): BrowserWindow {
    const browserOptions: BrowserWindowConstructorOptions = {
        autoHideMenuBar: true,
        height: 800,
        useContentSize: true,
        webPreferences: {
            backgroundThrottling: false,
            contextIsolation: false,
            devTools: !isProduction,
            nodeIntegration: true,
            webSecurity: false,
        },
        width: 1600,
    }

    const window = new BrowserWindow(browserOptions)

    window.setMenu(null)

    return window
}
