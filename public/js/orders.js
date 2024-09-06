$(document).ready(function () {
  // Function to get JWT token from cookies
  function getToken() {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('jwt='));
    return token ? token.split('=')[1] : null;
  }

  // Function to decode JWT token
  function getUserIdFromToken() {
    const token = getToken();
    if (token) {
      const decodedToken = jwt_decode(token);
      return decodedToken.id;
    }
    return null;
  }

  // Fetch orders on page load
  const userId = getUserIdFromToken();
  if (userId) {
    $.ajax({
      url: `/api/v1/order/${userId}?status=pending`,
      method: 'GET',
      success: function (response) {
        $('#order-details').empty();

        if (response.status === 'success' && response.data.orders.length > 0) {
          response.data.orders.forEach((order) => {
            if (order.status === 'pending') {
              $('#order-details').append(`
                    <div class="order-card" data-id="${order._id}">
                      <h3>Order ID: ${order._id}</h3>
                      <p><strong>Address:</strong> ${order.address}</p>
                      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                      <p class="subtotal"><strong>Subtotal:</strong> PKR ${order.subTotal}</p>
                      <h4>Items:</h4>
                      <ul class="items">
                        ${order.items
                          .map(
                            (item) => `
                          <li>
                            ${item.productName} - ${item.productQuantity} x PKR ${item.productPrice} (Discount: ${item.discountPercentage}%)
                          </li>
                        `,
                          )
                          .join('')}
                      </ul>
                      <button class="cancel-order-btn" data-id="${order._id}">Cancel Order</button>
                      <button class="received-order-btn" data-id="${order._id}">Order Received</button>
                    </div>
                  `);
            }
          });
          if (response.data.orders.length === 0) {
            alert('No pending orders found.');
          }
        } else {
          $('#order-details').html('<p>No pending orders found.</p>');
          alert('No pending orders found.');
        }

        $('#order-details').show();
      },
      error: function (xhr) {
        // Extract and display only the message part from the error response
        let errorMsg = 'Error fetching orders.';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          if (errorResponse.message) {
            errorMsg = errorResponse.message;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        alert(errorMsg);
        $('#order-details').html('<p>Error fetching orders.</p>');
      },
    });
  } else {
    alert('No token found.');
  }

  // Handle cancel order button click
  $(document).on('click', '.cancel-order-btn', function () {
    const orderId = $(this).data('id');
    $('#cancel-options').show();
    $('#submit-cancellation')
      .off('click')
      .on('click', function () {
        const reason = $('input[name="cancel-reason"]:checked').val();
        if (!reason) {
          alert('Please select a cancellation reason.');
          return;
        }

        const token = getToken();
        const orderCard = $(this).closest('.order-card');

        if (token) {
          $.ajax({
            url: `/api/v1/order/delete/${orderId}`,
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: JSON.stringify({ reason: reason }),
            contentType: 'application/json',
            success: function () {
              $('body').append(`
                <div id="cancel-card" class="cancel-card">
                    <i class="fa fa-circle-xmark"></i> Order Cancelled Successfully.
                </div>
            `);
              // showCancelMessage(orderCard); // Update UI
              // Show the success card
              $('#cancel-card')
                .fadeIn()
                .delay(3000)
                .fadeOut(function () {
                  // Redirect to /orders after 2 seconds
                  window.location.href = '/products';
                });
              // alert('Your order has been deleted successfully.');
              // showCancelMessage(orderCard); // Update UI
              // setTimeout(function () {
              //   orderCard.remove();
              //   window.location.href = '/products';
              // }, 1000); // Remove the card after 1 second
            },
            error: function (xhr) {
              console.error('Failed to cancel order:', xhr.responseText);
            },
          });
        }
      });

    $('#cancel-cancellation')
      .off('click')
      .on('click', function () {
        $('#cancel-options').hide();
      });
  });

  // Handle mark order as received button click
  $(document).on('click', '.received-order-btn', function () {
    const orderId = $(this).data('id');
    const token = getToken();

    if (token) {
      $.ajax({
        url: `/api/v1/order/completeOrder/${orderId}`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        success: function () {
          $(`.order-card[data-id="${orderId}"]`).remove(); // Remove the order card
          $('body').append(`
              <div id="success-card" class="success-card">
                  <i class="fa fa-check-circle"></i> Order Recieved Successfulyy Thanks for Shopping With Us!
              </div>
          `);
          // Show the success card
          $('#success-card')
            .fadeIn()
            .delay(3000)
            .fadeOut(function () {
              // Redirect to /orders after 2 seconds
              window.location.href = '/products';
            });
          // alert('Order marked as received.');
          // $(`.order-card[data-id="${orderId}"]`).remove(); // Remove the order card

          // setTimeout(function() {
          //   window.location.href = '/products';
          // }, 1000);
        },
        error: function (xhr) {
          console.error('Failed to mark order as received:', xhr.responseText);
        },
      });
    }
  });
});

// $(document).ready(function() {
//     try {
//       // Fetch the user ID from the JWT in cookies
//       const getToken = () => {
//         const token = document.cookie.split('; ').find(row => row.startsWith('jwt='));
//         return token ? token.split('=')[1] : null;
//       };

//       const token = getToken();
//       if (token) {
//         const decodedToken = jwt_decode(token);
//         const userId = decodedToken.id;

//         $.ajax({
//           url: `/api/v1/order/${userId}?status=pending`,
//           method: 'GET',
//           success: function(response) {
//             $('#order-details').empty();

//             if (response.status === 'success' && response.data.orders.length > 0) {
//               response.data.orders.forEach(order => {
//                 if (order.status === 'pending') {
//                   $('#order-details').append(`
//                     <div class="order-card" data-id="${order._id}">
//                       <h3>Order ID: ${order._id}</h3>
//                       <p><strong>Address:</strong> ${order.address}</p>
//                       <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
//                       <p><strong>Subtotal:</strong> PKR ${order.subTotal}</p>
//                       <h4>Items:</h4>
//                       <ul>
//                         ${order.items.map(item => `
//                           <li>
//                             ${item.productName} - ${item.productQuantity} x PKR ${item.productPrice} (Discount: ${item.discountPercentage}%)
//                           </li>
//                         `).join('')}
//                       </ul>
//                       <button class="cancel-order-btn" data-id="${order._id}">Cancel Order</button>
//                       <button class="received-order-btn" data-id="${order._id}">Order Received</button>
//                     </div>
//                   `);
//                 }
//               });
//             } else {
//               $('#order-details').html('<p>No pending orders found.</p>');
//             }

//             $('#order-details').show();
//           },
//           error: function(xhr) {
//             console.error('Failed to fetch order details:', xhr.responseText);
//             $('#order-details').html('<p>Error fetching orders.</p>');
//           }
//         });
//       } else {
//         console.error('No token found');
//       }
//     } catch (e) {
//       console.error('Failed to decode JWT:', e);
//     }
//   });
