$(document).ready(function () {
  // Toggle between cash-on-delivery and card payment forms
  $('input[name="paymentMethod"]').change(function () {
    const selectedPaymentMethod = $(this).val();
    if (selectedPaymentMethod === 'cash') {
      $('.checkout-form-cash').show();
      $('.checkout-form-card').hide();
    } else if (selectedPaymentMethod === 'card') {
      $('.checkout-form-cash').hide();
      $('.checkout-form-card').show();
    }
  });

  // Handle cash-on-delivery form submission
  $('#checkout-form-cash').submit(function (event) {
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
    // Check if address contains "Karachi"
    if (!address.toLowerCase().includes('islamabad')) {
      alert(
        'We do not deliver to your location. Delivery is only available in Islamabad.',
      );
      return;
    }

    const form = $(this);
    $.ajax({
      url: form.attr('action'), // URL from the form's action attribute
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getCookie('jwt')}`, // Include JWT token if necessary
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        phoneNumber: phoneNumber,
        address: address,
      }),
      success: function (response) {
        console.log('Order Placement Response:', response);
        if (response.status === 'success') {
          // Create and display the success card
          $('body').append(`
                        <div id="success-card" class="success-card">
                            <i class="fa fa-circle-xmark"></i> Order Confirmed
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
      complete: function () {
        // Re-enable the submit button after the request is complete (if applicable)
        // submitButton.prop('disabled', false);
      },
    });
  });

  // Handle card payment form submission
  $('#checkout-form-card').submit(function (event) {
    event.preventDefault();
    const form = $(this);

    // Stripe token creation and form submission logic here
    // Example:
    // stripe.createToken(cardElement).then(result => {
    //     if (result.error) {
    //         // Display error message
    //     } else {
    //         // Submit form with token
    //         $.ajax({
    //             url: form.attr('action'),
    //             method: 'POST',
    //             headers: {
    //                 Authorization: `Bearer ${getCookie('jwt')}`,
    //                 'Content-Type': 'application/json',
    //             },
    //             data: JSON.stringify({
    //                 token: result.token.id,
    //                 // other form data
    //             }),
    //             // handle success and error
    //         });
    //     }
    // });
  });

  function getCookie(name) {
    const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
    return cookieString ? cookieString[1] : null;
  }
});

// $(document).ready(function () {
//     // Toggle between cash-on-delivery and card payment forms
//     $('input[name="paymentMethod"]').change(function () {
//         const selectedPaymentMethod = $(this).val();
//         if (selectedPaymentMethod === 'cash') {
//             $('.checkout-form-cash').show();
//             $('.checkout-form-card').hide();
//         } else if (selectedPaymentMethod === 'card') {
//             $('.checkout-form-cash').hide();
//             $('.checkout-form-card').show();
//         }
//     });

//     // Handle cash-on-delivery form submission
//     $('#checkout-form-cash').submit(function (event) {
//         event.preventDefault();
//         const phoneNumber = $('#phoneNumber').val();
//         const address = $('#address').val();
//         const phoneError = $('#phone-error');
//         const addressError = $('#address-error');

//         // Validate phone number
//         const phoneRegex = /^[+][9][2]\d{10}$/;
//         if (!phoneRegex.test(phoneNumber)) {
//             phoneError.show();
//             return;
//         } else {
//             phoneError.hide();
//         }

//         const form = $(this);
//         $.ajax({
//             url: form.attr('action'), // URL from the form's action attribute
//             method: 'POST',
//             headers: {
//                 Authorization: `Bearer ${getCookie('jwt')}`, // Include JWT token if necessary
//                 'Content-Type': 'application/json',
//             },
//             data: JSON.stringify({
//                 phoneNumber: phoneNumber,
//                 address: address,
//             }),
//             success: function (response) {
//                 console.log('Order Placement Response:', response);
//                 if (response.status === 'success') {
//                     window.location.href = '/orders'; // Redirect to /orders on success
//                 } else {
//                     $('#error-message')
//                         .text('Failed to place order: ' + response.message)
//                         .show();
//                 }
//             },
//             error: function (xhr) {
//                 console.error('Error placing order:', xhr);
//                 let errorMessage = 'An error occurred. Please try again.';
//                 if (xhr.responseJSON && xhr.responseJSON.message) {
//                     errorMessage = xhr.responseJSON.message;
//                 } else if (xhr.responseText) {
//                     try {
//                         const errorResponse = JSON.parse(xhr.responseText);
//                         errorMessage = errorResponse.message || errorMessage;
//                     } catch (e) {
//                         // If responseText is not valid JSON, use the default errorMessage
//                     }
//                 }
//                 alert(errorMessage); // Show the error message in an alert
//             },
//             complete: function () {
//                 // Re-enable the submit button after the request is complete (if applicable)
//                 // submitButton.prop('disabled', false);
//             },
//         });
//     });

//     // Handle card payment form submission
//     $('#checkout-form-card').submit(function (event) {
//         event.preventDefault();
//         const form = $(this);

//         // Stripe token creation and form submission logic here
//         // Example:
//         // stripe.createToken(cardElement).then(result => {
//         //     if (result.error) {
//         //         // Display error message
//         //     } else {
//         //         // Submit form with token
//         //         $.ajax({
//         //             url: form.attr('action'),
//         //             method: 'POST',
//         //             headers: {
//         //                 Authorization: `Bearer ${getCookie('jwt')}`,
//         //                 'Content-Type': 'application/json',
//         //             },
//         //             data: JSON.stringify({
//         //                 token: result.token.id,
//         //                 // other form data
//         //             }),
//         //             // handle success and error
//         //         });
//         //     }
//         // });

//     });

//     function getCookie(name) {
//         const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
//         return cookieString ? cookieString[1] : null;
//     }
// });
