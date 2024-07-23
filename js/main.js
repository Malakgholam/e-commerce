import handelRemoteRequest from './shares/api.js';

// Get elements
const categoriesContainer = document.querySelector("#categories");
const loadingElement = document.querySelector("#loading");
const errorElement = document.querySelector("#error");
const mainElement = document.querySelector("#main-content");
const itemsElement = document.querySelector("#items");
const productsContainer = document.querySelector("#products-container");
const cartCountElement = document.querySelector("#cart-count");
const cartIcon = document.querySelector("#cart-icon");
const cartList = document.querySelector("#cart-list");
const cartItemsContainer = document.querySelector("#cart-items");
const closeCartBtn  = document.querySelector("#close-cart-btn");
let cartCount = 0;

let cartItems = []; // Array to hold cart items

function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  localStorage.setItem('cartCount', cartCount);
}

function loadCart() {
  const storedCartItems = localStorage.getItem('cartItems');
  const storedCartCount = localStorage.getItem('cartCount');
  if (storedCartItems) {
    cartItems = JSON.parse(storedCartItems);
  }
  if (storedCartCount) {
    cartCount = parseInt(storedCartCount, 10);
  }
  updateCartCount();
  renderCartItems();
}

// Function to update cart count display
function updateCartCount() {
  cartCountElement.textContent = cartCount;
}

function toggleCartList() {
  if (cartList.style.transform === "translateX(100%)") {
    cartList.style.transform = "translateX(0)";
  } else {
    cartList.style.transform = "translateX(100%)";
  }
}

cartIcon.addEventListener("click", toggleCartList);
closeCartBtn.addEventListener("click", toggleCartList);

// Function to add product to cart
function addToCart(product) {
  const existingProduct = cartItems.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    product.quantity = 1;
    cartItems.push(product);
  }
  cartCount++;
  updateCartCount();
  renderCartItems();
  saveCart();
}

function removeFromCart(productId) {
  const productIndex = cartItems.findIndex(item => item.id === productId);
  if (productIndex !== -1) {
    cartCount -= cartItems[productIndex].quantity;
    cartItems.splice(productIndex, 1);
    updateCartCount();
    renderCartItems();
    saveCart();
  }
}

function increaseQuantity(productId) {
  const product = cartItems.find(item => item.id == productId);
  if (product) {
    product.quantity++;
    cartCount++;
    updateCartCount();
    renderCartItems();
    saveCart();
  }
}

function decreaseQuantity(productId) {
  const product = cartItems.find(item => item.id == productId);
  if (product && product.quantity > 1) {
    product.quantity--;
    cartCount--;
    updateCartCount();
    renderCartItems();
    saveCart();
  }
}



// Function to render cart items
function renderCartItems() {
  cartItemsContainer.innerHTML = ''; // Clear previous cart items
  cartItems.forEach(product => {
    const cartItemHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3 py-3 ">
        <img src="${product.thumbnail}" alt="${product.title}" class="img-thumbnail" style="width: 50px; height: 50px;">
        <div class="flex-grow-1 ms-3">
          <h5 class="mb-1">${product.title}</h5>
          <p class="mb-1">Price: ${product.quantity} × $${product.price} = $${product.quantity * product.price}</p>
        </div>
        <div>
          <button class="btn btn-sm btn-danger remove-btn mb-3" data-id="${product.id}">X</button>
          <button class="btn btn-sm btn-primary increase-btn mb-3" data-id="${product.id}">↑</button>
          <button class="btn btn-sm btn-secondary decrease-btn" data-id="${product.id}">↓</button>
        </div>
      </div>
    `;
    cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
  });

  document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-id"));
      removeFromCart(productId);
    });
  });

  document.querySelectorAll(".increase-btn").forEach(button => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-id"));
      increaseQuantity(productId);
    });
  });

  document.querySelectorAll(".decrease-btn").forEach(button => {
    button.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-id"));
      decreaseQuantity(productId);
    });
  });
}

// Function to fetch all products
function fetchAllProducts() {
  handelRemoteRequest(
    "products",
    function (data) {
      productsContainer.innerHTML = ''; // Clear previous products
      data.products.forEach(product => {
        productsContainer.insertAdjacentHTML('beforeend', createProductCard(product));
      });

      document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", function () {
          const productId = parseInt(this.getAttribute("data-id"));
          const product = data.products.find(p => p.id == productId);
          addToCart(product);
        });
      });
    },
    function (err) {
      errorElement.classList.remove("d-none");
      errorElement.classList.add("d-flex");
      errorElement.querySelector(".alert").textContent = err.message;
    },
    function () {
      loadingElement.classList.remove("d-none");
      loadingElement.classList.add("d-flex");
    },
    function () {
      loadingElement.classList.remove("d-flex");
      loadingElement.classList.add("d-none");
    }
  );
}

// Fetch categories and initial products
document.addEventListener('DOMContentLoaded', () => {
  loadCart(); // Load cart from local storage
  handelRemoteRequest(
  "products/categories",
  function (data) {
    mainElement.classList.remove("d-none");
    mainElement.classList.add("row");
    categoriesContainer.innerHTML = data
      .map((item) => `<li class="category-item" id="${item.slug}">${item.name}</li>`)
      .join("");

    document.querySelectorAll(".category-item").forEach(item => {
      item.addEventListener("click", function () {
        const category = this.id;
        fetchProductsByCategory(category);
      });
    });

    fetchAllProducts();
  },
  function (err) {
    errorElement.classList.remove("d-none");
    errorElement.classList.add("d-flex");
    mainElement.classList.remove("row");
    mainElement.classList.add("d-none");
    errorElement.querySelector(".alert").textContent = err.message;
  },
  function () {
    loadingElement.classList.remove("d-none");
    loadingElement.classList.add("d-flex");
  },
  function () {
    loadingElement.classList.remove("d-flex");
    loadingElement.classList.add("d-none");
  }
);

});

// Function to fetch products by category
function fetchProductsByCategory(category) {
  handelRemoteRequest(
    `products/category/${category}`,
    function (data) {
      productsContainer.innerHTML = ''; // Clear previous products
      data.products.forEach(product => {
        productsContainer.insertAdjacentHTML('beforeend', createProductCard(product));
      });

      document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", function () {
          const productId = parseInt(this.getAttribute("data-id"));
          const product = data.products.find(p => p.id == productId);
          addToCart(product);
        });
      });
    },
    function (err) {
      errorElement.classList.remove("d-none");
      errorElement.classList.add("d-flex");
      errorElement.querySelector(".alert").textContent = err.message;
    },
    function () {
      loadingElement.classList.remove("d-none");
      loadingElement.classList.add("d-flex");
    },
    function () {
      loadingElement.classList.remove("d-flex");
      loadingElement.classList.add("d-none");
    }
  );
}

// Function to create a product card
function createProductCard(product) {
  return `
    <div class="col-md-4 mb-4">
      <div class="border shadow rounded-2 px-3 py-3">
        <img src="${product.thumbnail}" class="w-100 mb-2" style="height: 200px">
        <div class="mb-3">
          <h5 class="mb-1">${product.title}</h5>
          <p>${product.description}</p>
        </div>
        <div class="d-flex gap-1 mb-3 align-items-center">
          <span>★</span>
          <div class="px-2 bg-danger bg-opacity-75 rounded-2">${product.rating}</div>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <p class="fw-bold mb-0 fs-3">$${product.price}</p>
          <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add To Cart</button>
        </div>
      </div>
    </div>
  `;
}

// Initial update of cart count display
updateCartCount();
