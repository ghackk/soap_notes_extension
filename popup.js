document.getElementById('start').addEventListener('click', async () => {
    const tab = await getCurrentTab();
    if (!tab) return alert('Require an active tab');
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content-script.js"]
    });
});

document.getElementById('stop').addEventListener('click', async () => {
    const tab = await getCurrentTab();
    if (!tab) return alert('Require an active tab');
    chrome.tabs.sendMessage(tab.id, { message: 'stop' });
});

async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onMessage.addListener(({ message, text }) => {
    if (message === 'transcriptavailable') {
        showLatestTranscript(text);
    }
});

function showLatestTranscript(text) {
    document.getElementById('transcriptionOutput').innerHTML = text;
}

