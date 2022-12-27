declare module 'ipc' {
    interface IBrowserFolderRequest {
        buttonLabel: string
        defaultPath: string
        title: string
        type: 'folder-request'
    }

    interface IBrowseFolderResponse {
        folder: string
        type: 'folder-response'
    }

    interface IConfigRequest {
        type: 'config-request'
    }

    interface IConfigResponse {
        configName: string
        type: 'config-response'
    }

    type TRequest = IBrowserFolderRequest | IConfigRequest

    type TRequestType = TRequest['type']

    type TResponse = IBrowseFolderResponse | IConfigResponse

    type TResponseType = TResponse['type']

    type TTypedRequest<T extends TRequestType> = TRequest & { type: T }

    type TTypedResponse<T extends TResponseType> = TResponse & { type: T }
}
