const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  strawberry: { name: "Strawberry", emoji: "🍓" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  
  // Check for banana/strawberry incompatibility
  if (product === "banana" && basket.includes("strawberry")) {
    showErrorMessage("Strawberries and bananas cannot be combined.");
    return false;
  }
  if (product === "strawberry" && basket.includes("banana")) {
    showErrorMessage("Strawberries and bananas cannot be combined.");
    return false;
  }
  
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
  return true;
}

function showErrorMessage(message) {
  // Try to find existing error message element
  let errorMsg = document.getElementById("errorMessage");
  if (!errorMsg) {
    // Create error message element
    errorMsg = document.createElement("div");
    errorMsg.id = "errorMessage";
    errorMsg.className = "error-message";
    errorMsg.setAttribute("role", "alert");
    errorMsg.setAttribute("aria-live", "polite");
    
    // Insert after button-container or append to content-box
    const buttonContainer = document.querySelector(".button-container");
    const contentBox = document.querySelector(".content-box");
    if (buttonContainer && buttonContainer.parentNode) {
      // Insert after button-container within its parent
      if (buttonContainer.nextSibling) {
        buttonContainer.parentNode.insertBefore(errorMsg, buttonContainer.nextSibling);
      } else {
        buttonContainer.parentNode.appendChild(errorMsg);
      }
    } else if (contentBox) {
      contentBox.appendChild(errorMsg);
    } else {
      // Fallback: append to body
      document.body.appendChild(errorMsg);
    }
  }
  
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (errorMsg) {
      errorMsg.style.display = "none";
    }
  }, 5000);
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  const success = origAddToBasket(product);
  if (success) {
    renderBasketIndicator();
  }
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
