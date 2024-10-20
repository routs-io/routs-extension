import { ContentMethods } from "../utils/content.js";

const POPUP_WIDTH = 400;
const POPUP_HEIGHT = 600;

declare type MessageRequest = {
    id: number,
    method: string,
    params: any[]
};

declare type SendMessageResponse = {
    status: "success" | "fail",
}

const requests = new Map<number, {
    request: any,
    response: any
}>();

let popup: chrome.windows.Window;

const SUPPORTED_POPUP_METHODS = [
    "navigate",
    "eth_requestAccounts",
    "eth_signTransactions"
]

const SUPPORTED_CONTENT_METHODS = [
    "eth_accounts"
]

function generateId() {
    return Math.floor(Math.random() * 1000000);
}

async function calculatePopupPosition() {
    const lastFocused = await chrome.windows.getLastFocused();

    if (!lastFocused) return { top: 0, left: 0 }

    const top = lastFocused.top;
    const left = Math.max(
        (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - POPUP_WIDTH),
        0,
    );

    return { top, left }
}

async function openPopup(): Promise<SendMessageResponse> {
    const { top, left } = await calculatePopupPosition();

    popup = await chrome.windows.create({
        type: 'popup',
        url: chrome.runtime.getURL(`index.html`),
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        top,
        left
    });

    if (popup) {
        console.log('popup opened')
        return { status: 'success' };
    }
    else {
        return { status: 'fail' }
    }
}

function closePopup() {
    if (popup?.id) chrome.windows.remove(popup.id)
}

async function handlePopupMethod(message: MessageRequest): Promise<SendMessageResponse | undefined> {
    const popupOpened = await openPopup();
    if (popupOpened.status === 'fail') {
        return popupOpened;
    }

    await sendMessage(message);
}

async function handleContentMethod(message: MessageRequest): Promise<any> {
    if (message.method in ContentMethods) {
        return await ContentMethods[message.method as keyof typeof ContentMethods]();
    } else {
        throw new Error(`Method ${message.method} not supported`);
    }
}

async function sendMessage(message: MessageRequest) {
    setTimeout(async () => {
        requests.set(message.id, { request: message, response: undefined });
        await chrome.runtime.sendMessage(message);
        return { status: 'success' };
    }, 500);
}

async function waitForResponse(id: number) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const request = requests.get(id);
            if (request?.response) {
                closePopup();
                clearInterval(interval);
                resolve(request.response);
            }
        }, 100);
    });
}

chrome.runtime.onMessageExternal.addListener(async function (request, sender, sendResponse) {
    console.log('background.js', request);
    console.log('external', sender);

    try {
        if (![...SUPPORTED_POPUP_METHODS, ...SUPPORTED_CONTENT_METHODS].includes(request.method)) {
            sendResponse({ status: 'fail', message: 'Method not supported' });
            return;
        }

        console.log('passed supporting check');

        if (SUPPORTED_CONTENT_METHODS.includes(request.method)) {
            console.log('passed content check');

            const response = await handleContentMethod(request);
            sendResponse(response);
            return;
        }

        if (SUPPORTED_POPUP_METHODS.includes(request.method)) {
            console.log('passed popup check');

            const id = generateId();
            requests.set(id, { request: undefined, response: undefined });

            console.log('request generated id', id);

            await handlePopupMethod({ id, direction: 'in', ...request });

            if (requests.get(id)) {
                sendResponse(await waitForResponse(id));
            }
            return;
        }
    }
    catch (error) {
        console.log(error);
        sendResponse({ status: 'fail' });
    }
})

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    console.log('background.js', request);
    console.log('internal', sender);
    if (request.direction == 'out' && requests.get(request.id)) {
        const req = requests.get(request.id);
        if (req) {
            req.response = request.data;
        }
    }
    sendResponse({ status: 'success', data: request.data });
})