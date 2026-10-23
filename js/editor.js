
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("textInput");
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("statusMessage");

  if (!editor) return;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function focusEditor() {
    editor.focus();
  }

  document.getElementById("pasteBtn").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setStatus("Clipboard access is unavailable. Use Ctrl+V instead.");
        focusEditor();
        return;
      }

      const text = await navigator.clipboard.readText();

      if (text) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        editor.setRangeText(text, start, end, "end");
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        setStatus("Text pasted");
      } else {
        setStatus("Clipboard is empty");
      }
    } catch {
      setStatus("Clipboard permission denied. Use Ctrl+V instead.");
      focusEditor();
    }
  });

  document.getElementById("cleanBtn").addEventListener("click", () => {
    const cleaned = editor.value
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    editor.value = cleaned;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    setStatus("Text cleaned");
    focusEditor();
  });

  document.getElementById("uploadBtn").addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];

    if (!file) return;

    const allowedExtensions = /\.(txt|csv|md|html|json)$/i;

    if (!allowedExtensions.test(file.name)) {
      setStatus("Please select a supported text file");
      fileInput.value = "";
      return;
    }

    // Limit imports to 2 MB for this browser-only version.
    if (file.size > 2 * 1024 * 1024) {
      setStatus("File is too large. Maximum size is 2 MB.");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setStatus("Unable to read this file");
        return;
      }

      editor.value = reader.result;
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      setStatus(`Loaded ${file.name}`);
      focusEditor();
      fileInput.value = "";
    };

    reader.onerror = () => {
      setStatus("Error reading file");
      fileInput.value = "";
    };

    reader.readAsText(file);
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    if (!editor.value) {
      setStatus("There is no text to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(editor.value);
      setStatus("Text copied to clipboard");
    } catch {
      // Fallback for browsers that block clipboard API access.
      focusEditor();
      editor.select();

      const copied = document.execCommand("copy");

      editor.setSelectionRange(
        editor.value.length,
        editor.value.length
      );

      setStatus(copied
        ? "Text copied to clipboard"
        : "Copy failed. Select the text and copy manually.");
    }
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    if (!editor.value) {
      setStatus("There is no text to download");
      return;
    }

    const blob = new Blob([editor.value], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "word-counter-text.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setStatus("Text downloaded");
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!editor.value) {
      setStatus("The editor is already empty");
      return;
    }

    const confirmed = window.confirm(
      "Clear all text from the editor?"
    );

    if (!confirmed) return;

    editor.value = "";
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    setStatus("Editor cleared");
    focusEditor();
  });
});
