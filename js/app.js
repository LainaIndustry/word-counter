
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("textInput");

  if (!textInput || !window.WordCounter) return;

  const elements = {
    wordCount: document.getElementById("wordCount"),
    charCount: document.getElementById("charCount"),
    charNoSpaces: document.getElementById("charNoSpaces"),
    sentenceCount: document.getElementById("sentenceCount"),
    paragraphCount: document.getElementById("paragraphCount"),
    uniqueCount: document.getElementById("uniqueCount"),
    readingTime: document.getElementById("readingTime"),
    speakingTime: document.getElementById("speakingTime"),
    liveWordCount: document.getElementById("liveWordCount"),
    keywordList: document.getElementById("keywordList"),
    statusMessage: document.getElementById("statusMessage"),
    wordGoal: document.getElementById("wordGoal"),
    goalProgress: document.getElementById("goalProgress"),
    goalMessage: document.getElementById("goalMessage")
  };

  let currentGoal = 500;

  function setStatus(message) {
    elements.statusMessage.textContent = message;
  }

  function renderKeywords(keywords) {
    elements.keywordList.replaceChildren();

    if (!keywords.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Enter text to see keywords.";
      elements.keywordList.appendChild(empty);
      return;
    }

    const maximum = keywords[0][1];

    keywords.forEach(([word, count]) => {
      const row = document.createElement("div");
      row.className = "keyword-row";

      const details = document.createElement("div");
      details.className = "keyword-name";

      const name = document.createElement("div");
      name.textContent = word;

      const bar = document.createElement("div");
      bar.className = "keyword-bar";

      const fill = document.createElement("span");
      fill.style.width = `${(count / maximum) * 100}%`;

      bar.appendChild(fill);
      details.append(name, bar);

      const countLabel = document.createElement("strong");
      countLabel.textContent = String(count);

      row.append(details, countLabel);
      elements.keywordList.appendChild(row);
    });
  }

  function updateGoal(wordCount) {
    const percentage = currentGoal > 0
      ? Math.min(100, (wordCount / currentGoal) * 100)
      : 0;

    elements.goalProgress.style.width = `${percentage}%`;

    if (wordCount >= currentGoal) {
      elements.goalMessage.textContent =
        `Goal reached! ${wordCount} of ${currentGoal} words.`;
    } else {
      elements.goalMessage.textContent =
        `${wordCount} of ${currentGoal} words (${Math.floor(percentage)}%).`;
    }
  }

  function updateCounts() {
    const text = textInput.value;
    const stats = window.WordCounter.analyzeText(text);

    elements.wordCount.textContent = stats.words.toLocaleString();
    elements.charCount.textContent = stats.characters.toLocaleString();
    elements.charNoSpaces.textContent =
      stats.charactersNoSpaces.toLocaleString();
    elements.sentenceCount.textContent =
      stats.sentences.toLocaleString();
    elements.paragraphCount.textContent =
      stats.paragraphs.toLocaleString();
    elements.uniqueCount.textContent =
      stats.uniqueWords.toLocaleString();

    elements.readingTime.textContent = stats.readingTime;
    elements.speakingTime.textContent = stats.speakingTime;

    elements.liveWordCount.textContent =
      `${stats.words.toLocaleString()} ${stats.words === 1 ? "word" : "words"}`;

    renderKeywords(stats.keywords);
    updateGoal(stats.words);
  }

  textInput.addEventListener("input", () => {
    updateCounts();
    setStatus("Counting updated");
  });

  elements.wordGoal.addEventListener("change", () => {
    const value = Number(elements.wordGoal.value);

    if (Number.isInteger(value) && value > 0) {
      currentGoal = value;
      updateCounts();
    } else {
      elements.wordGoal.value = String(currentGoal);
      setStatus("Enter a goal greater than zero");
    }
  });

  document.getElementById("setGoalBtn").addEventListener("click", () => {
    const value = Number(elements.wordGoal.value);

    if (!Number.isInteger(value) || value < 1) {
      setStatus("Enter a valid word goal");
      elements.wordGoal.focus();
      return;
    }

    currentGoal = value;
    updateCounts();
    setStatus("Writing goal updated");
  });

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label",
      isOpen ? "Close navigation" : "Open navigation");
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  document.getElementById("currentYear").textContent =
    String(new Date().getFullYear());

  updateCounts();
});
