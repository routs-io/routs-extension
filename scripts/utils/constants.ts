export const POPUP_WIDTH = 378;
export const POPUP_HEIGHT = 639;

export const SOCKET_URL = 'wss://routs.dankov.co.uk'

export const SUPPORTED_POPUP_METHODS = [
    "navigate",
    "eth_requestAccounts",
    "eth_signTransactions",
    "fuel_generateAccounts",
]

export const SUPPORTED_CONTENT_METHODS = [
    "eth_accounts",
    "fuel_accounts",
    "ws_setupTask"
]

export const SUPPORTED_EVENTS = [
    "accountsChanged",
    "accountsAdded"
]