

$(document).ready(function () {
  const products = JSON.parse(sessionStorage.getItem('searchResults')) || [];

  if (products.length === 0) {
    $('.products-container').html('<p>No products found.</p>');
    return;
  }

  let productsHTML = products
    .map(
      (product) => `
    <div class="product-card">
        <img class="product-image" src="/img/products/${product.photo}" alt="${product.name}">
        <div class="product-details">
            <h3 class="product-name">${product.name}</h3>
            
            <div class="price">
                <div class="original-price">PKR ${product.price}</div>
                ${product.discountPercentage ? `<div class="discounted-price">PKR ${(product.price - product.price * (product.discountPercentage / 100)).toFixed(2)}</div>` : ''}
            </div>
            <button class="add-to-cart" data-product-id="${product._id}">Add to Cart</button>
        </div>
    </div>
  `,
    )
    .join('');

  $('.products-container').html(productsHTML);

  $('.products-container').on('click', '.add-to-cart', function () {
    const productId = $(this).data('product-id');
    const jwtCookie = getCookie('jwt');

    if (!jwtCookie) {
      console.error('JWT not found in cookie.');
      return;
    }

    const userId = getUserIdFromJwt(jwtCookie); // Extract userId from JWT

    if (!userId) {
      console.error('User ID not found in JWT.');
      return;
    }

    // API request to add product to cart
    $.ajax({
      url: `/api/v1/cart/${userId}/addToCart`,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      data: JSON.stringify({ productId, productQuantity: 1 }),
      success: function (response) {
        if (response.status === 'success') {
          console.log('Product added to cart successfully!');
        } else {
          console.error('Failed to add product to cart:', response.error);
        }
      },
      error: function (xhr) {
        console.error('Error adding product to cart:', xhr);
      },
    });
  });

  // Function to extract userId from JWT
  function getUserIdFromJwt(jwt) {
    try {
      const decoded = jwt_decode(jwt);
      return decoded.id;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  // Function to get a cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
});
