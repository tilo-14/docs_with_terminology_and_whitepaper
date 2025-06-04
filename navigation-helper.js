// Simple fix for JSON RPC Methods navigation issue
// Prevents reloading overview page when trying to collapse from overview

(function () {
  "use strict";

  console.log("🚀 Simple JSON RPC navigation fix loaded");

  const OVERVIEW_PATH = "/api-reference/json-rpc-methods/index";

  function isOnOverviewPage() {
    return window.location.pathname === OVERVIEW_PATH;
  }

  function isJsonRpcGroupHeader(element) {
    const text = element.textContent?.trim();
    return text && text.includes("JSON RPC Methods") && text.length < 50;
  }

  function handleJsonRpcClick(event) {
    const element = event.currentTarget;
    const isOnOverview = isOnOverviewPage();

    // Check if the section appears to be open by looking for visible method links
    const methodLinks = document.querySelectorAll(
      'a[href*="/api-reference/json-rpc-methods/"]:not([href$="/index"]):not([style*="display: none"])'
    );
    const hasVisibleMethods = methodLinks.length > 0;

    // Additional check: look for aria-expanded state on the element or its parent
    let ariaExpanded = null;
    let current = element;
    while (current && current !== document.body) {
      const aria = current.getAttribute("aria-expanded");
      if (aria) {
        ariaExpanded = aria === "true";
        break;
      }
      current = current.parentElement;
    }

    const sectionIsOpen = hasVisibleMethods || ariaExpanded === true;

    console.log(
      `📊 Navigation state - On overview: ${isOnOverview}, Section open: ${sectionIsOpen}, Methods visible: ${methodLinks.length}, aria-expanded: ${ariaExpanded}`
    );

    if (sectionIsOpen) {
      console.log("✅ Section is open - allowing normal collapse behavior");
      // Let the normal dropdown collapse behavior happen
      return;
    } else {
      // Section is closed
      if (isOnOverview) {
        console.log(
          "🎯 On overview with closed section - opening section without navigation"
        );
        // We're already on overview, just open the section
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // Force the section to open
        setTimeout(() => {
          const dropdownTrigger = element.closest(
            '[role="button"], button, [aria-expanded], .group-header, [data-testid*="group"]'
          );
          if (dropdownTrigger) {
            dropdownTrigger.setAttribute("aria-expanded", "true");
            dropdownTrigger.click();
          } else {
            element.setAttribute("aria-expanded", "true");
          }
        }, 10);
      } else {
        console.log(
          "🚀 Not on overview with closed section - navigating to overview"
        );
        // We're not on overview, navigate to it (preserve original behavior)
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        setTimeout(() => {
          window.location.href = OVERVIEW_PATH;
        }, 50);
      }
    }
  }

  function setupHandlers() {
    console.log("🔧 Setting up JSON RPC click handlers...");

    const allElements = document.querySelectorAll("*");
    let handlersAdded = 0;

    allElements.forEach((element) => {
      if (isJsonRpcGroupHeader(element)) {
        // Remove existing handler
        element.removeEventListener("click", handleJsonRpcClick, true);

        // Add new handler
        element.addEventListener("click", handleJsonRpcClick, {
          capture: true,
          passive: false,
        });

        handlersAdded++;
        console.log(
          `✅ Handler added to: "${element.textContent
            .trim()
            .substring(0, 30)}"`
        );
      }
    });

    console.log(`📍 Total handlers added: ${handlersAdded}`);
  }

  function initialize() {
    setTimeout(setupHandlers, 500);

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(setupHandlers, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Handle navigation
  window.addEventListener("popstate", initialize);

  // Debug helper
  window.debugJsonRpc = {
    isOnOverview: isOnOverviewPage,
    setupHandlers: setupHandlers,
    currentPath: () => window.location.pathname,
  };

  console.log("🔧 Debug: window.debugJsonRpc");
})();
