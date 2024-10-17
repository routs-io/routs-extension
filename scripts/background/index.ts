const POPUP_WIDTH = 400;
const POPUP_HEIGHT = 600;

declare type MessageRequest = {
    id: number,
    action: string,
} & any;

declare type SendMessageResponse = {
    status: "success" | "fail",
}

const requests = new Map<number, {
    request: any,
    response: any
}>();

let popup: chrome.windows.Window;

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

async function openPopup() {
    const { top, left } = await calculatePopupPosition();

    popup = await chrome.windows.create({
        type: 'popup',
        url: chrome.runtime.getURL(`index.html`),
        width: POPUP_WIDTH,
        height: POPUP_HEIGHT,
        top,
        left
    });

    console.log(popup);
    return popup ? true : false;
}

function closePopup() {
    if (popup?.id) chrome.windows.remove(popup.id)
}

async function openPopupAndSendMessage(message: MessageRequest): Promise<SendMessageResponse | undefined> {
    if (await openPopup()) {
        console.log('popup opened')
    }
    else {
        return { status: 'fail' }
    }
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
        const id = generateId();
        requests.set(id, { request: undefined, response: undefined });
        console.log(id);
        switch (request.action) {
            case 'navigate':
                console.log('navigate');
                await openPopupAndSendMessage({ id, action: 'navigate', targetRoute: request.targetRoute, direction: 'in' });
                break;
            case 'getWallets':
                console.log('getWallets');
                await openPopupAndSendMessage({ id, action: 'getWallets', direction: 'in' });
                break;
            /*case 'signTransactions':
                console.log('signTransactions');
                sendResponse(await signTransactions(request.transactions));
                break;*/
            default:
                break;
        }
        if (requests.get(id)) {
            console.log(requests);
            sendResponse(await waitForResponse(id));
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
    closePopup()
    sendResponse({ status: 'success', data: request.data });
})