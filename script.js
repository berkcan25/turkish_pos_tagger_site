let morph_data = {};

const sentenceInput = document.getElementById("sentence-input");
const resultContainer = document.getElementById("result-container");
const charButtons = document.querySelectorAll(".button-group .btn");
const tooltip = document.getElementById("tooltip");
const themeToggleButton = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");

async function handleTag(sentence) {
    if (!sentence.trim()) {
        handleBuild([]);
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/tag", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sentence }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Server Response:", data.tokens);
        handleBuild(data.tokens);
        
    } catch (error) {
        console.error("Error fetching tags:", error);
        resultContainer.innerHTML = `<span style="color: red;">Error: Could not connect to server.</span>`;
    }
}

const OPENING_PUNC = ['(', '[', '“'];
const AMBIGUOUS_PUNC = ['"'];
let isInsideQuotes = false;

function handleBuild(tokens) {
    resultContainer.innerHTML = "";
    isInsideQuotes = false;

    if (!tokens || tokens.length === 0) {
        if (sentenceInput.value.trim() === "") {
            resultContainer.innerHTML = '<p id="empty-state-message">Ayrıştırma sonuçları burada görünecek.</p>';
        }
        return;
    }

    tokens.forEach((token_obj, i) => {
        const wordSpan = document.createElement("span");
        wordSpan.classList.add("word-token"); 
        
        const rootString = Object.keys(token_obj)[0];
        const currentTokenTags = Object.values(token_obj);
        const isCurrentPunc = currentTokenTags.includes("Punctuation"); 
        
        let isOpeningPunc = false;
        if (isCurrentPunc) {
            if (OPENING_PUNC.includes(rootString)) {
                isOpeningPunc = true;
            } else if (AMBIGUOUS_PUNC.includes(rootString)) {
                if (!isInsideQuotes) {
                    isOpeningPunc = true;
                    isInsideQuotes = true;
                } else {
                    isOpeningPunc = false;
                    isInsideQuotes = false;
                }
            }
        }

        Object.entries(token_obj).forEach(([string, tag]) => {
            const morphemeSpan = document.createElement("span");
            morphemeSpan.textContent = string;
            morphemeSpan.classList.add('morpheme-span');
            morphemeSpan.style.cursor = 'help';
            morphemeSpan.dataset.tag = tag;
            morphemeSpan.dataset.morpheme = string;
            morphemeSpan.dataset.root = rootString; 
            wordSpan.appendChild(morphemeSpan);
        });

        resultContainer.appendChild(wordSpan);

        if (i + 1 < tokens.length) {
            const nextTokenTags = Object.values(tokens[i + 1]);
            const isNextPunc = nextTokenTags.includes("Punctuation");

            if (!isNextPunc && !isOpeningPunc) {
                wordSpan.style.marginRight = "6px";
            }
        }
    });
}

function handleButton(e) {
    const char = e.currentTarget.innerHTML;
    const newSentence = sentenceInput.value + char;
    sentenceInput.value = newSentence;
    handleTag(newSentence);
    sentenceInput.focus();
}

function setAppTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        localStorage.setItem('theme', 'light');
        setAppTheme('light');
    } else {
        localStorage.setItem('theme', 'dark');
        setAppTheme('dark');
    }
}

async function init() {
    try {
        const preferredTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setAppTheme(preferredTheme);

        const response = await fetch("morphological_tags.json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        morph_data = await response.json(); 

        sentenceInput.addEventListener("input", (e) => {
            handleTag(e.target.value);
        });

        charButtons.forEach(button => {
            button.addEventListener("click", handleButton);
        });

        themeToggleButton.addEventListener('click', toggleTheme);

        resultContainer.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('morpheme-span')) {
                const root = e.target.dataset.root;
                const morpheme = e.target.dataset.morpheme;
                const tag = e.target.dataset.tag;
                
                tooltip.innerHTML = `<strong>Root:</strong> ${root}<br><strong>Morpheme:</strong> ${morpheme} (${tag})`;
                tooltip.style.display = 'block';
            }
        });

        resultContainer.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('morpheme-span')) {
                tooltip.style.display = 'none';
            }
        });

        resultContainer.addEventListener('mousemove', (e) => {
            const offset = 15;
            let x = e.pageX + offset;
            let y = e.pageY + offset;

            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            if (x + tooltipWidth > viewportWidth + scrollX) {
                x = e.pageX - tooltipWidth - offset;
            }
            if (y + tooltipHeight > viewportHeight + scrollY) {
                y = e.pageY - tooltipHeight - offset;
            }

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        handleBuild([]);
        console.log("App initialized.");
    } catch (error) {
        console.error("Failed to initialize app:", error);
        resultContainer.innerHTML = `<span style="color: red;">Error: Could not load core app data.</span>`;
    }
}

init();
