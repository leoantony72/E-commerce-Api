if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    button.addEventListener("click", addToCartClicked);
  }

  document
    .getElementsByClassName("btn-purchase")[0]
    .addEventListener("click", purchaseClicked);
}

var stripeHandler = StripeCheckout.configure({
  key: stripePublicKey,
  locale: "en",
  token: async function (token) {
    let items = [];
    //cart
    const response = await fetch("/api/cart", {
      method: "GET",
      headers: {
        credentials: "same-origin",
        Cookie:
          "SESSION=s%3A8KKErbvm2mUQzlHfiGfLJfb1o-tnR4xT.bjvzW3CL1YeBN1C7yNHxzE8GlhW37H85vpEFdwL5NxI",
      },
    });
    const data = await response.json();

    data.products.forEach(function (item) {
      //console.log(item);
      items.push({
        pid: item.pid,
        quantity: item.quantity,
      });
    });
    items.map(function (item) {
      console.log(item);
    });

    await fetch("/api/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        stripeTokenId: token.id,
        items: items,
      }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        alert(data.message, +"Failed purchases :" + [data.failed]);
        var cartItems = document.getElementsByClassName("cart-items")[0];
        while (cartItems.hasChildNodes()) {
          cartItems.removeChild(cartItems.firstChild);
        }
        updateCartTotal();
      })
      .catch(function (error) {
        console.error(error);
      });
  },
});

function purchaseClicked() {
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  var price = parseFloat(priceElement.innerText.replace("$", "")) * 100;
  stripeHandler.open({
    amount: price,
  });
}

function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  updateCartTotal();
}

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  var button = event.target;
  var shopItem = button.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var id = shopItem.dataset.itemId;
  addItemToCart(title, price, imageSrc, id);
  updateCartTotal();
}

function addItemToCart(title, price, imageSrc, id) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  cartRow.dataset.itemId = id;
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }
  var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var price = parseFloat(priceElement.innerText.replace("$", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}
