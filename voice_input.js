
document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById("userInput");

  // Create microphone button
  const micButton = document.createElement("button");
  micButton.innerHTML = "🎤";
  micButton.className = "button button-primary";
  micButton.style.padding = "8px 12px";
  micButton.style.borderRadius = "6px";
  micButton.style.fontSize = "1rem";
  micButton.style.cursor = "pointer";
  micButton.style.marginLeft = "4px";

  // Insert mic button next to input field
  const chatInputContainer = document.querySelector(".chat-input");
  chatInputContainer.insertBefore(micButton, chatInputContainer.children[1]);

  // Web Speech API setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micButton.disabled = true;
    micButton.textContent = "🎤 (unsupported)";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  let isListening = false;
  let listenTimeout;

  micButton.addEventListener("click", () => {
    if (isListening) return;

    isListening = true;
    micButton.textContent = "Listening...";
    recognition.start();

    listenTimeout = setTimeout(() => {
      recognition.stop();
    }, 5000); // Stop after 5 seconds
  });

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    inputField.value = transcript;
  };

  recognition.onend = function () {
    isListening = false;
    micButton.textContent = "🎤";
    clearTimeout(listenTimeout);
  };

  recognition.onerror = function () {
    isListening = false;
    micButton.textContent = "🎤";
    clearTimeout(listenTimeout);
  };
});
