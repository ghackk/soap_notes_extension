// This file can be used for handling background tasks or events.
// Currently, it's not necessary for the basic functionality of the transcription extension.
chrome.runtime.onInstalled.addListener(() => {
    console.log('Mic & Tab Transcription extension installed.');
});
