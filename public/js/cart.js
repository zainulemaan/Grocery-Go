console.log('JS Loaded');

$(document).ready(function () {
  console.log('Document Ready');

  function fetchCart() {
    const jwtCookie = getCookie('jwt');
    if (!jwtCookie) {
      console.error('JWT not found in cookie.');
      return;
    }

    const userId = getUserIdFromJwt(jwtCookie);
    if (!userId) {
      console.error('User ID not found in JWT.');
      return;
    }

    $.ajax({
      url: `/api/v1/cart/${userId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      success: function (response) {
        console.log('Cart Fetch Response:', response);
        if (response.status === 'success') {
          const cart = response.data;
          if (!cart || !cart.items || cart.items.length === 0) {
            $('.cart-container').html('<p>Your cart is empty.</p>');
            return;
          }

          let cartHtml = '';
          let overallSubtotal = 0;
          let totalDiscount = 0;
          const shippingCharges = 130;

          cart.items.forEach((item) => {
            const discountPercentage = item.discountPercentage || 0;
            const originalPrice = parseFloat(item.productPrice);
            const discountedPrice = (
              originalPrice *
              (1 - discountPercentage / 100)
            ).toFixed(2);
            const subtotal = (discountedPrice * item.productQuantity).toFixed(
              2,
            );

            overallSubtotal += parseFloat(
              item.productPrice * item.productQuantity,
            );
            totalDiscount +=
              originalPrice * item.productQuantity - parseFloat(subtotal);

            cartHtml += `
                            
                            <div class="cart-item" data-product-id="${item.productId}" data-quantity-available="${item.quantityAvailable}">
                                <img class="product-image" src="/img/products/${item.productPhoto}" alt="${item.productName}">
                                <div class="product-details">
                                    <h3 class="product-name">${item.productName}</h3>
                                    
                                    <div class="price">
                                        <div class="original-price">PKR ${originalPrice.toFixed(2)}</div>
                                        ${discountPercentage ? `<div class="discounted-price">PKR ${discountedPrice}</div>` : ''}
                                    </div>
                                    <div class="quantity-controls">
                                        <button class="quantity-decrease" data-product-id="${item.productId}">-</button>
                                        <input type="number" class="quantity-input" value="${item.productQuantity}" min="1" data-product-id="${item.productId}">
                                        <button class="quantity-increase" data-product-id="${item.productId}">+</button>
                                    </div>
                                    <div class="subtotal" data-product-id="${item.productId}">Subtotal: PKR ${subtotal}</div>
                                </div>
                                <button class="remove-item-button" data-product-id="${item.productId}">Remove Item</button>
                            </div>
                        `;
          });

          const grandTotal = (
            overallSubtotal -
            totalDiscount +
            shippingCharges
          ).toFixed(2);

          cartHtml += `
                        <div class="cart-summary">
                            <div class="summary-left">
                                <div class="overall-subtotal">Grand Total: PKR ${grandTotal}</div>
                                <div class="total-discount">Total Discount: PKR ${totalDiscount.toFixed(2)}</div>
                                <div class="shipping-charges">Shipping Charges: PKR ${shippingCharges}</div>
                                
                                

                                
                            </div>
                        </div>
                    `;

          $('.cart-container').html(cartHtml);
          $('#proceed-next').on('click', function () {
            window.location.href = '/placeorder';
          });
        } else {
          $('.cart-container').html('<p>Failed to fetch cart.</p>');
          console.error('Failed to fetch cart:', response.message);
        }
      },
      error: function (xhr) {
        console.error('Error fetching cart:', xhr);
        $('.cart-container').html('<p>Your Cart Is Empty.</p>');
      },
    });
  }

  function getCookie(name) {
    const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
    return cookieString ? cookieString[1] : null;
  }

  function getUserIdFromJwt(jwt) {
    try {
      const decoded = jwt_decode(jwt);
      return decoded.id;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  function updateQuantity(userId, productId, newQuantity) {
    const jwtCookie = getCookie('jwt');
    if (!jwtCookie) {
      console.error('JWT not found in cookie.');
      return;
    }

    $.ajax({
      url: `/api/v1/cart/${userId}/remove-items`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        productId: productId,
        productQuantity: newQuantity,
      }),
      success: function (response) {
        console.log('Update Quantity Response:', response);
        if (response.status === 'success') {
          fetchCart(); // Refresh the cart after updating
        } else {
          console.error('Failed to update quantity:', response.message);
        }
      },
      error: function (xhr) {
        console.error('Error updating quantity:', xhr);
        toastr.error('Not Enough Stock Available For This Product Thanks!');

        $(`.quantity-input[data-product-id="${productId}"]`).val(1);
        updateSubtotal(productId, 1);
      },
    });
  }

  function removeItem(userId, productId) {
    const jwtCookie = getCookie('jwt');
    if (!jwtCookie) {
      console.error('JWT not found in cookie.');
      return;
    }

    $.ajax({
      url: `/api/v1/cart/${userId}/EmptyCart`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({ productId: productId }),
      success: function (response) {
        console.log('Remove Item Response:', response);
        if (response.status === 'success') {
          fetchCart(); // Refresh the cart after removing item
        } else {
          console.error('Failed to remove item:', response.message);
        }
      },
      error: function (xhr) {
        console.error('Error removing item:', xhr);
        toastr.error('Error removing item from cart.');
      },
    });
  }

  function validateQuantityInput(input) {
    const value = input.val();
    const numericValue = value.replace(/^0+/, ''); // Remove leading zeros
    if (numericValue === '' || parseInt(numericValue, 10) <= 0) {
      alert('Quantity must be a positive number.');
      input.val(1); // Set to default value of 1
    } else if (!/^\d+$/.test(numericValue)) {
      alert('Please type a valid quantity.');
      input.val(1); // Set to default value of 1
    } else {
      input.val(numericValue); // Update with cleaned value
    }
  }

  function updateSubtotal(productId, quantity) {
    const quantityInput = $(`.quantity-input[data-product-id="${productId}"]`);
    const originalPrice = parseFloat(
      $(`.product-details[data-product-id="${productId}"] .original-price`)
        .text()
        .replace('PKR ', ''),
    );
    const discountPrice =
      parseFloat(
        $(`.product-details[data-product-id="${productId}"] .discounted-price`)
          .text()
          .replace('PKR ', ''),
      ) || originalPrice;
    const subtotal = (discountPrice * quantity).toFixed(2);

    $(`.subtotal[data-product-id="${productId}"]`).text(
      `Subtotal: PKR ${subtotal}`,
    );
  }

  // Initial fetch of cart items
  fetchCart();

  // Event listeners
  $(document).on('click', '.remove-item-button', function () {
    const productId = $(this).data('product-id');
    const userId = getUserIdFromJwt(getCookie('jwt'));
    if (userId) {
      removeItem(userId, productId);
    }
  });

  $(document).on('click', '.quantity-increase', function () {
    console.log('Quantity Increase Clicked');
    const productId = $(this).data('product-id');
    const quantityInput = $(this).siblings('.quantity-input');
    const currentQuantity = parseInt(quantityInput.val());
    quantityInput.val(currentQuantity + 1);
    updateQuantity(
      getUserIdFromJwt(getCookie('jwt')),
      productId,
      currentQuantity + 1,
    );
  });

  $(document).on('click', '.quantity-decrease', function () {
    const productId = $(this).data('product-id');
    const userId = getUserIdFromJwt(getCookie('jwt'));
    const quantityInput = $(`.quantity-input[data-product-id="${productId}"]`);
    let currentQuantity = parseInt(quantityInput.val());
    console.log(`Current Quantity: ${currentQuantity}`);
    if (currentQuantity > 1) {
      quantityInput.val(currentQuantity - 1);
      if (userId) {
        updateQuantity(userId, productId, currentQuantity - 1);
      }
      updateSubtotal(productId, currentQuantity - 1);
    }
  });

  $(document).on('change', '.quantity-input', function () {
    const productId = $(this).data('product-id');
    const userId = getUserIdFromJwt(getCookie('jwt'));
    const newQuantity = parseInt($(this).val());
    const availableQuantity = parseInt(
      $(`.cart-item[data-product-id="${productId}"]`).data(
        'available-quantity',
      ),
    );

    console.log(`Available Quantity: ${availableQuantity}`);

    validateQuantityInput($(this));

    if (userId) {
      if (newQuantity > availableQuantity) {
        alert('Not enough stock available.');
        $(this).val(1); // Fix the value to 1
        newQuantity = 1;
      } else {
        updateQuantity(userId, productId, newQuantity);
        updateSubtotal(productId, newQuantity);
      }
    }
  });
});
//   $('#checkout-form').submit(function (event) {
//     event.preventDefault();
//     const phoneNumber = $('#phoneNumber').val();
//     const address = $('#address').val();
//     const phoneError = $('#phone-error');
//     const addressError = $('#address-error');

//     // Validate phone number
//     const phoneRegex = /^[+][9][2]\d{10}$/;
//     if (!phoneRegex.test(phoneNumber)) {
//       phoneError.show();
//       return;
//     } else {
//       phoneError.hide();
//     }

//     const form = $(this);
//     $.ajax({
//       url: form.attr('action'), // URL from the form's action attribute
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${getCookie('jwt')}`, // Include JWT token if necessary
//         'Content-Type': 'application/json',
//       },
//       data: JSON.stringify({
//         phoneNumber: phoneNumber,
//         address: address,
//       }),
//       success: function (response) {
//         console.log('Order Placement Response:', response);
//         if (response.status === 'success') {
//           window.location.href = '/orders'; // Redirect to /orderSuccessful on success
//         } else {
//           $('#error-message')
//             .text('Failed to place order: ' + response.message)
//             .show();
//         }
//       },
//       error: function (xhr) {
//         console.error('Error placing order:', xhr);
//         let errorMessage = 'An error occurred. Please try again.';
//         if (xhr.responseJSON && xhr.responseJSON.message) {
//           errorMessage = xhr.responseJSON.message;
//         } else if (xhr.responseText) {
//           try {
//             const errorResponse = JSON.parse(xhr.responseText);
//             errorMessage = errorResponse.message || errorMessage;
//           } catch (e) {
//             // If responseText is not valid JSON, use the default errorMessage
//           }
//         }
//         alert(errorMessage); // Show the error message in an alert
//       },
//       //   error: function (xhr) {
//       //     console.error('Error placing order:', xhr);
//       //     $('#address-error')
//       //       .text(
//       //         'Please enter a valid address. For example: "123 Main St, Karachi, Sindh, 74200"',
//       //       )
//       //       .show();
//       //   },
//       complete: function () {
//         // Re-enable the submit button after the request is complete (if applicable)
//         // submitButton.prop('disabled', false);
//       },
//     });
//     // Removed the line that causes double submission
//   });
// });
