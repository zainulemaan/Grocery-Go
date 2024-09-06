$(document).ready(function () {
  // Initialize Stripe
  const stripe = Stripe(
    'pk_test_51PlCr6RwmcWoHdE68mmxpGamdlMSadF9pF43lmUK40HbjLe8WEHqnwq45u1FymZbnpV4OrrYs3QAiyONuXx2mFxA00skMHLwx0',
  ); // Replace with your Stripe public key
  const elements = stripe.elements();
  const cardElement = elements.create('card');

  // Mount the card element
  cardElement.mount('#card-element');

  $('#checkout-form').submit(function (event) {
    event.preventDefault();
    const phoneNumber = $('#phoneNumber').val();
    const address = $('#address').val();
    const phoneError = $('#phone-error');
    const addressError = $('#address-error');

    // Validate phone number
    const phoneRegex = /^[+][9][2]\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      phoneError.show();
      return;
    } else {
      phoneError.hide();
    }

    // Check if address contains "Karachi"
    if (!address.toLowerCase().includes('islamabad')) {
      alert(
        'We do not deliver to your location. Delivery is only available in Islamabad.',
      );
      return;
    }

    // Validate address
    if (address.trim() === '') {
      addressError.show();
      return;
    } else {
      addressError.hide();
    }

    // Create a PaymentMethod with Stripe
    stripe
      .createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Customer Name', // Optionally include customer name or other details
        },
      })
      .then(function (result) {
        if (result.error) {
          $('#error-message')
            .text('Payment error: ' + result.error.message)
            .show();
        } else {
          // Send paymentMethod.id to your server
          submitOrder(result.paymentMethod.id);
        }
      });
  });

  function submitOrder(paymentMethodId) {
    $.ajax({
      url: '/api/v1/order/' + getUserId() + '/placeOrder', // Use userId from a reliable source
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getCookie('jwt')}`, // Include JWT token if necessary
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        phoneNumber: $('#phoneNumber').val(),
        address: $('#address').val(),
        paymentMethod: 'Stripe',
        paymentToken: paymentMethodId, // Send payment method ID to the server
      }),
      success: function (response) {
        if (response.status === 'success') {
          $('body').append(`
            <div id="success-card" class="success-card">
                <i class="fa fa-check-circle"></i> Order Confirmed
            </div>
        `);
          // Show the success card
          $('#success-card')
            .fadeIn()
            .delay(2000)
            .fadeOut(function () {
              // Redirect to /orders after 2 seconds
              window.location.href = '/orders';
            });
        } else {
          $('#error-message')
            .text('Failed to place order: ' + response.message)
            .show();
        }
      },
      error: function (xhr) {
        console.error('Error placing order:', xhr);
        let errorMessage = 'An error occurred. Please try again.';
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        } else if (xhr.responseText) {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch (e) {
            // If responseText is not valid JSON, use the default errorMessage
          }
        }
        alert(errorMessage); // Show the error message in an alert
      },
    });
  }

  function getCookie(name) {
    const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
    return cookieString ? cookieString[1] : null;
  }

  function getUserId() {
    const token = getCookie('jwt');
    if (token) {
      const decoded = jwt_decode(token); // Decode JWT to get user details
      return decoded.id; // Replace with the actual field from your JWT payload
    }
    return 'user-id-placeholder'; // Fallback if JWT is not available or userId is not found
  }
});

// $(document).ready(function () {
//     $('#checkout-form').submit(function (event) {
//       event.preventDefault();
//       const phoneNumber = $('#phoneNumber').val();
//       const address = $('#address').val();
//       const phoneError = $('#phone-error');
//       const addressError = $('#address-error');

//       // Validate phone number
//       const phoneRegex = /^[+][9][2]\d{10}$/;
//       if (!phoneRegex.test(phoneNumber)) {
//         phoneError.show();
//         return;
//       } else {
//         phoneError.hide();
//       }

//       const form = $(this);
//       $.ajax({
//         url: form.attr('action'), // URL from the form's action attribute
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${getCookie('jwt')}`, // Include JWT token if necessary
//           'Content-Type': 'application/json',
//         },
//         data: JSON.stringify({
//           phoneNumber: phoneNumber,
//           address: address,
//         }),
//         success: function (response) {
//           console.log('Order Placement Response:', response);
//           if (response.status === 'success') {
//             window.location.href = '/orders'; // Redirect to /orders on success
//           } else {
//             $('#error-message')
//               .text('Failed to place order: ' + response.message)
//               .show();
//           }
//         },
//         error: function (xhr) {
//           console.error('Error placing order:', xhr);
//           let errorMessage = 'An error occurred. Please try again.';
//           if (xhr.responseJSON && xhr.responseJSON.message) {
//             errorMessage = xhr.responseJSON.message;
//           } else if (xhr.responseText) {
//             try {
//               const errorResponse = JSON.parse(xhr.responseText);
//               errorMessage = errorResponse.message || errorMessage;
//             } catch (e) {
//               // If responseText is not valid JSON, use the default errorMessage
//             }
//           }
//           alert(errorMessage); // Show the error message in an alert
//         },
//         complete: function () {
//           // Re-enable the submit button after the request is complete (if applicable)
//           // submitButton.prop('disabled', false);
//         },
//       });
//     });

//     function getCookie(name) {
//       const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
//       return cookieString ? cookieString[1] : null;
//     }
//   });
