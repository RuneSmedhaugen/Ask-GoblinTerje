let sarcasticMode = false;

updateHTML();

function Decide() {
  document.getElementById("app").innerHTML = /*HTML*/ `
        <div class="mainContainer">
            <h1>Ask GoblinTerje</h1>
            <input type="text" id="input" placeholder="Enter your question here..." />
            <button id="decideButton" onclick="getAIResponse()">Ask</button>
            <button id="sarcastButton" onclick="toggleSarcasticMode()">Sarcasm Mode</button>
            <div id="answerContainer"></div>
            <div id="tailContainer"></div>
            <div id="imgContainer">
            <img id="goblinImageBase" src="img/TerjeTrollEyesOpen.png" alt="Goblin Terje" />
            </div>
        </div>
    `;
  updateSarcasticButtonStyle();

  // event listener for pressing enter instead of clicking the button every damn time
  const inputField = document.getElementById("input");
  inputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      getAIResponse();
    }
  });
}

async function getAIResponse() {
  const question = document.getElementById("input").value;
  if (!question) {
    alert("Please enter a question!");
    return;
  }

  const apiKey = CONFIG.API_KEY;

  // Prompt to send with the question
  const prompt = sarcasticMode
    ? `Answer this including a definitive yes or no, but sarcastically or insulting:\n\n"${question}"`
    : `Answer this question with minimum 2 sentences and including a definitive yes or no:\n\n"${question}"`;

  const goblinImage = document.getElementById("goblinImageBase");
  const answerContainer = document.getElementById("answerContainer");

  // Set GoblinTerje to "thinking" mode
  answerContainer.innerHTML = `<p>GoblinTerje is thinking...</p>`;
  goblinImage.src = "img/TerjeTrollEyesClosed.png"; // Directly switch to "thinking" image

  try {
    // Sending request to Mistral AI model
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    // Parse the response
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Extract the answer from the response
    const answer = data.choices[0]?.message?.content || "No response received.";

    // Random delay between 4 and 6 seconds
    const delay = Math.random() * (6000 - 4000) + 4000;

    setTimeout(() => {
      // Display the answer after the delay
      displayAnswerWordByWord(answer, answerContainer);

      // Set GoblinTerje to "finished" mode
      goblinImage.src = "img/TerjeTrollEyesOpen.png"; // Directly switch to "finished" image
    }, delay);
  } catch (error) {
    console.error("Error fetching answer:", error);
    alert("Failed to fetch answer from Mistral. Check the console for details.");

    // Ensure GoblinTerje exits "thinking" mode even if there's an error
    goblinImage.src = "img/TerjeTrollEyesOpen.png"; // Directly switch to "finished" image
  }
}

// Function to display the answer word by word (tror den funker nå)
function displayAnswerWordByWord(answer, container) {
  const words = answer.split(" ");
  container.innerHTML = "";
  let index = 0;
  const goblinImage = document.getElementById("goblinImageBase");
  let rotateDirection = true;

  const interval = setInterval(() => {
    if (index < words.length) {
      container.innerHTML += words[index] + " ";
      index++;

      // rotate GoblinTerje
      const rotationAngle = rotateDirection ? 5 : -5;
      goblinImage.style.transform = `rotate(${rotationAngle}deg)`;
      rotateDirection = !rotateDirection;
    } else {
      clearInterval(interval);
      goblinImage.style.transform = "rotate(0deg)";
    }
  }, 200); //speed (200ms per word)
}

function toggleSarcasticMode() {
  sarcasticMode = !sarcasticMode;
  updateSarcasticButtonStyle();
}

function updateSarcasticButtonStyle() {
  const sarcastButton = document.getElementById("sarcastButton");
  if (sarcastButton) {
    sarcastButton.style.backgroundColor = sarcasticMode ? "green" : "";
    sarcastButton.style.color = sarcasticMode ? "white" : "";
  }
}

function updateHTML() {
  Decide();
}
