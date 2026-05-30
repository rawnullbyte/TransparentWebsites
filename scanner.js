(async function () {
  const domain = window.location.hostname.replace("www.", "");
  const STYLE_ID = "dynamic-transparency-css";

  const baseSelectors = new Set(["html", "body", ":root", "#root"]);
  const searchSelectors = new Set();
  const foundVariables = new Set();

  function runScanner() {
    if (document.getElementById(STYLE_ID) && foundVariables.size > 0) return;

    const elementsWithStyles = document.querySelectorAll("[style]");
    elementsWithStyles.forEach(el => {
      const styleAttr = el.getAttribute("style");
      const varsFound = styleAttr.match(/(--[a-zA-Z0-9_-]+)/g);
      if (varsFound) {
        varsFound.forEach(v => {
          if (v.includes("background") || v.includes("color") || v.includes("search")) {
            foundVariables.add(v);
          }
        });
      }
    });

    const allElementsWithClass = document.querySelectorAll("[class]");
    allElementsWithClass.forEach(el => {
      el.classList.forEach(cls => {
        const lowerCls = cls.toLowerCase();
        if (["stream", "wrapper", "container", "content"].some(k => lowerCls.includes(k))) {
          baseSelectors.add(`.${cls}`);
        }
      });
    });

    const allElements = document.querySelectorAll("*");
    allElements.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      if (tagName.includes("search") || tagName.includes("wrapper") || tagName.includes("-")) {
        searchSelectors.add(tagName);
      }
      if (el.classList) {
        el.classList.forEach(cls => {
          if (cls.toLowerCase().includes("search")) {
            searchSelectors.add(`.${cls}`);
          }
        });
      }
    });

    let css = "";

    css += `${Array.from(baseSelectors).join(", ")} {\n`;
    foundVariables.forEach(v => {
      if (v.includes("background") || v.includes("color")) {
        css += `    ${v}: transparent !important;\n`;
      }
    });
    css += "    background-color: transparent !important;\n";
    css += "    background: transparent !important;\n";
    css += "}\n\n";

    if (searchSelectors.size > 0) {
      css += `${Array.from(searchSelectors).join(", ")} {\n`;
      css += "    background: transparent !important;\n";
      css += "    background-color: transparent !important;\n";
      foundVariables.forEach(v => {
        if (v.includes("search") && v.includes("color")) {
          css += `    ${v}: transparent !important;\n`;
        }
      });
      css += "    --box-shadow-level-3: none !important;\n";
      css += "}\n";
    }

    let styleTag = document.getElementById(STYLE_ID);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleTag);
    }
    styleTag.textContent = css;
  }

  function removeStyles() {
    const styleTag = document.getElementById(STYLE_ID);
    if (styleTag) {
      styleTag.remove();
      console.log(`Removed transparency styles for ${domain} seamlessly.`);
    }
  }

  const data = await chrome.storage.local.get(domain);
  const transparencyIsAllowed = data[domain] !== false;

  if (transparencyIsAllowed) {
    runScanner();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runScanner);
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleTransparency") {
      if (message.enabled) {
        console.log(`Toggled ON: Injecting styles dynamically for ${domain}...`);
        runScanner();
      } else {
        console.log(`Toggled OFF: Snapping styles away dynamically for ${domain}...`);
        removeStyles();
      }
    }
  });
})();