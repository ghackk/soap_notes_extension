(function() {
    let audioChunks = [];  // To store chunks of recorded audio
    let recorder;  // To hold the MediaRecorder instance
    const transcriptionDiv = document.createElement('div'); // Create a div to display transcriptions

    // Styling for the transcription display
    transcriptionDiv.style.position = 'fixed';
    transcriptionDiv.style.bottom = '10px';
    transcriptionDiv.style.right = '10px';
    transcriptionDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    transcriptionDiv.style.border = '1px solid black';
    transcriptionDiv.style.padding = '10px';
    transcriptionDiv.style.zIndex = '9999';
    transcriptionDiv.style.maxHeight = '300px';
    transcriptionDiv.style.overflowY = 'auto';
    document.body.appendChild(transcriptionDiv); // Append the div to the body

    // Get access to the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create audio context
        const input = audioContext.createMediaStreamSource(stream); // Create an audio input from the stream
        const mixedStream = audioContext.createMediaStreamDestination(); // Create a mixed audio output

        input.connect(mixedStream); // Connect the input stream to the mixed stream

        // Create a MediaRecorder to record the mixed audio
        recorder = new MediaRecorder(mixedStream.stream);

        // When data becomes available from the recorder
        recorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                audioChunks.push(event.data); // Push the available audio data into the audioChunks array
            }
        };

        // When recording stops
        recorder.onstop = async function () {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' }); // Create a blob from the recorded audio chunks
            audioChunks = []; // Reset the chunks for the next recording

            const formData = new FormData();
            formData.append('file', audioBlob); // Append the audio blob to formData
            formData.append('model', 'whisper-1'); // Specify the Whisper model to use

            // Call OpenAI Whisper API for transcription
            try {
                const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer Replace with your actual API key`, // Replace with your actual API key
                    },
                    body: formData,
                });

                const data = await response.json(); // Parse the JSON response
                if (data.text) {
                    console.log(data.text); // Log the transcription text to the console
                    transcriptionDiv.innerText += data.text + '\n'; // Display the transcription text on the webpage
                    // Send transcription to the popup if needed
                    chrome.runtime.sendMessage({ message: 'transcriptavailable', text: data.text });
                } else {
                    console.error('Transcription error:', data); // Log any errors
                }
            } catch (error) {
                console.error('Error calling Whisper API:', error); // Handle any errors in the API call
            }
        };

        recorder.start(); // Start the recorder
    });

    // Listen for stop messages from the popup
    chrome.runtime.onMessage.addListener(({ message }) => {
        if (message === 'stop') {
            if (recorder) {
                recorder.stop(); // Stop recording
                alert('Transcription ended');
            }
        }
    });
})();
