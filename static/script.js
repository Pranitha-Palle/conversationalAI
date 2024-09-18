document.addEventListener('DOMContentLoaded', function() {
    const recordButton = document.getElementById('recordButton');
    const stopButton = document.getElementById('stopButton');
    const audioElement = document.getElementById('audioElement');
    const transcriptElement = document.getElementById('transcript');
    const textInput = document.getElementById('textInput');
    const synthesizeButton = document.getElementById('synthesizeButton');

    let mediaRecorder;
    let audioChunks = [];

    // Start recording
    recordButton.addEventListener('click', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            transcriptElement.textContent = result.transcript;
        };

        recordButton.disabled = true;
        stopButton.disabled = false;
    });

    // Stop recording
    stopButton.addEventListener('click', () => {
        mediaRecorder.stop();
        recordButton.disabled = false;
        stopButton.disabled = true;
        audioChunks = [];
    });

    // Synthesize text to speech
    synthesizeButton.addEventListener('click', async () => {
        const text = textInput.value;
        const response = await fetch('/synthesize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        const result = await response.json();
        audioElement.src = result.audioUrl;
        audioElement.play();
    });
});
