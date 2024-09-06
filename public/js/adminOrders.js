$(document).ready(function () {
  $.get('/api/v1/order/admin/Orders', function (response) {
    const { pendingOrders, completedOrders, canceledOrders } = response.data;

    const renderOrders = (orders, status) => {
      return orders
        .map(
          (order, index) => `
                <li class="order-item">
                    <h3>#${index + 1} - Order ID: ${order._id}</h3>
                    <p>User: ${order.userId.name} (${order.userId.email})</p>
                    <p>Email: ${order.userId.email}</p>
                    <p>Subtotal: PKR ${order.subTotal}</p>
                    <p>Address: ${order.address}</p>
                    <p>Phone Number: ${order.phoneNumber}</p>
                    <p>Payment Method: ${order.paymentMethod}</p>
                    <p>Status: ${status} ${status === 'Completed' ? '<i class="fas fa-check-circle"></i>' : status === 'Pending' ? '<i class="fas fa-hourglass-half"></i>' : '<i class="fas fa-times-circle"></i>'}</p>
                    <p>Created At: ${new Date(order.createdAt).toLocaleString()}</p>
                    <h4>Items:</h4>
                    <ul>
                        ${order.items
                          .map(
                            (item) => `
                            <li>
                                ${item.productName} - PKR ${item.productPrice} x ${item.productQuantity}
                            </li>
                        `,
                          )
                          .join('')}
                     </ul>
                    ${
                      status === 'Pending'
                        ? `
                        <div class="order-actions">
                            <button class="btn-delete" data-order-id="${order._id}">Delete Order</button>
                            <button class="btn-done" data-order-id="${order._id}">Order Done</button>
                            <button class="btn-print" data-order-id="${order._id}">Print Receipt</button>
                        </div>
                    `
                        : ''
                    }
                </li>
            `,
        )
        .join('');
    };

    $('#completedOrders').html(renderOrders(completedOrders, 'Completed'));
    $('#pendingOrders').html(renderOrders(pendingOrders, 'Pending'));
    $('#canceledOrders').html(renderOrders(canceledOrders, 'Canceled'));

    $(document).on('click', '.btn-delete', function () {
      const orderId = $(this).data('order-id');
      $.ajax({
        url: `/api/v1/order/admin/delete/${orderId}`,
        type: 'DELETE',
        success: function (response) {
          alert('Order canceled successfully!');
          location.reload();
        },
        error: function () {
          alert('Error canceling the order.');
        },
      });
    });

    $(document).on('click', '.btn-done', function () {
      const orderId = $(this).data('order-id');
      $.ajax({
        url: `/api/v1/order/completeOrder/${orderId}`,
        type: 'PATCH',
        success: function (response) {
          alert('Order marked as done successfully!');
          location.reload();
        },
        error: function () {
          alert('Error marking the order as done.');
        },
      });
    });

    $(document).on('click', '.btn-print', function () {
      const orderId = $(this).data('order-id');
      fetch(`/api/v1/order/admin/receipt/${orderId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            const receiptData = data.data;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Add logo
            const logoImg = new Image();
            logoImg.src = '/img/grocerygo.png'; // Replace with your logo path
            logoImg.onload = function () {
              doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Adjust size and position as needed

              // Set font size and style
              doc.setFont('Helvetica', 'normal');
              doc.setFontSize(14);

              doc.text(receiptData.storeName, 10, 40);
              doc.text(receiptData.storeAddress, 10, 50);
              doc.text(`Contact: ${receiptData.storeContact}`, 10, 60);
              doc.text(`Order ID: ${receiptData.orderId}`, 10, 70);
              doc.text(`User: ${receiptData.userName}`, 10, 80);
              doc.text(`Email: ${receiptData.userEmail}`, 10, 90);
              doc.text(`Address: ${receiptData.address}`, 10, 100);
              doc.text(`Phone Number: ${receiptData.phoneNumber}`, 10, 110);
              doc.text(`Payment Method: ${receiptData.paymentMethod}`, 10, 120);
              doc.text(`Subtotal: PKR ${receiptData.subTotal}`, 10, 140);
              doc.text(`Created At: ${receiptData.createdAt}`, 10, 130);

              doc.setFontSize(12);
              doc.text('Items:', 10, 140);
              let y = 150;
              receiptData.items.forEach((item) => {
                doc.text(
                  `${item.productName} - PKR ${item.productPrice} x ${item.productQuantity} (Discount: ${item.discountPercentage}%) Total: ${item.itemTotal}`,
                  10,
                  y,
                );
                y += 10;
              });

              doc.text(`Subtotal: PKR ${receiptData.subTotal}`, 10, y);
              y += 10;
              doc.text(receiptData.terms, 10, y);

              // Save the PDF
              doc.save(`receipt_${receiptData.orderId}.pdf`);
            };
          } else {
            alert('Error fetching receipt.');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  });
});

// $(document).ready(function () {
//   $.get('/api/v1/order/admin/Orders', function (response) {
//     const { pendingOrders, completedOrders, canceledOrders } = response.data;

//     const renderOrders = (orders, status) => {
//       return orders
//         .map(
//           (order, index) => `
//                 <li class="order-item">
//                     <h3>#${index + 1} - Order ID: ${order._id}</h3>
//                     <p>User: ${order.userId.name} (${order.userId.email})</p>
//                     <p>Email: ${order.userId.email}</p>
//                     <p>Subtotal: PKR ${order.subTotal}</p>
//                     <p>Address: ${order.address}</p>
//                     <p>Phone Number: ${order.phoneNumber}</p>
//                     <p>Payment Method: ${order.paymentMethod}</p>
//                     <p>Status: ${status} ${status === 'Completed' ? '<i class="fas fa-check-circle"></i>' : status === 'Pending' ? '<i class="fas fa-hourglass-half"></i>' : '<i class="fas fa-times-circle"></i>'}</p>
//                     <p>Created At: ${new Date(order.createdAt).toLocaleString()}</p>
//                     <h4>Items:</h4>
//                     <ul>
//                         ${order.items
//                           .map(
//                             (item) => `
//                             <li>
//                                 ${item.productName} - $${item.productPrice} x ${item.productQuantity}
//                             </li>
//                         `,
//                           )
//                           .join('')}
//                      </ul>
//                     ${
//                       status === 'Pending'
//                         ? `
//                         <div class="order-actions">
//                             <button class="btn-delete" data-order-id="${order._id}">Delete Order</button>
//                             <button class="btn-done" data-order-id="${order._id}">Order Done</button>
//                             <button class="btn-print" data-order-id="${order._id}">Print Receipt</button>
//                         </div>
//                     `
//                         : ''
//                     }
//                 </li>
//             `,
//         )
//         .join('');
//     };

//     $('#completedOrders').html(renderOrders(completedOrders, 'Completed'));
//     $('#pendingOrders').html(renderOrders(pendingOrders, 'Pending'));
//     $('#canceledOrders').html(renderOrders(canceledOrders, 'Canceled'));

//     // Event listeners for buttons
//     $(document).on('click', '.btn-delete', function () {
//       const orderId = $(this).data('order-id');
//       $.ajax({
//         url: `/api/v1/order/admin/delete/${orderId}`,
//         type: 'DELETE',
//         success: function (response) {
//           alert('Order canceled successfully!');
//           // Optionally, refresh the order list
//           location.reload();
//         },
//         error: function () {
//           alert('Error canceling the order.');
//         },
//       });
//     });

//     $(document).on('click', '.btn-done', function () {
//       const orderId = $(this).data('order-id');
//       $.ajax({
//         url: `/api/v1/order/completeOrder/${orderId}`,
//         type: 'PATCH',
//         success: function (response) {
//           alert('Order marked as done successfully!');
//           // Optionally, refresh the order list
//           location.reload();
//         },
//         error: function () {
//           alert('Error marking the order as done.');
//         },
//       });
//     });

//     $(document).on('click', '.btn-print', function () {
//       const orderId = $(this).data('order-id');
//       fetch(`/api/v1/order/admin/receipt/${orderId}`)
//         .then(response => response.json())
//         .then(data => {
//           if (data.status === 'success') {
//             const receiptData = data.data;
//             const { jsPDF } = window.jspdf;
//             const doc = new jsPDF();

//             doc.setFontSize(12);
//             doc.text(`Store: ${receiptData.storeName}`, 10, 10);
//             doc.text(`Address: ${receiptData.storeAddress}`, 10, 20);
//             doc.text(`Contact: ${receiptData.storeContact}`, 10, 30);
//             doc.text(`Order ID: ${receiptData.orderId}`, 10, 40);
//             doc.text(`User: ${receiptData.userName} (${receiptData.userEmail})`, 10, 50);
//             doc.text(`Address: ${receiptData.address}`, 10, 60);
//             doc.text(`Phone Number: ${receiptData.phoneNumber}`, 10, 70);
//             doc.text(`Payment Method: ${receiptData.paymentMethod}`, 10, 80);
//             doc.text(`Created At: ${receiptData.createdAt}`, 10, 90);
//             doc.text('Items:', 10, 100);
//             let y = 110;
//             receiptData.items.forEach(item => {
//               doc.text(`${item.productName} - ${item.productPrice} x ${item.productQuantity} (Discount: ${item.discountPercentage}%) Total: ${item.itemTotal}`, 10, y);
//               y += 10;
//             });
//             doc.text(`Subtotal: ${receiptData.subTotal}`, 10, y);
//             y += 10;
//             doc.text(receiptData.terms, 10, y);

//             doc.save(`receipt_${receiptData.orderId}.pdf`);
//           } else {
//             alert('Error fetching receipt.');
//           }
//         })
//         .catch(error => {
//           console.error('Error:', error);
//         });
//     });
//   });
// });

// $(document).ready(function () {
//   $.get('/api/v1/order/admin/Orders', function (response) {
//     const { pendingOrders, completedOrders, canceledOrders } = response.data;

//     const renderOrders = (orders, status) => {
//       return orders
//         .map(
//           (order, index) => `
//                 <li class="order-item">
//                     <h3> #${index + 1}-Order ID: ${order._id}</h3>
//                     <p>User: ${order.userId.name} (${order.userId.email})</p>
//                     <p>Email: ${order.userId.email}</p>
//                     <p>Subtotal: PKR ${order.subTotal}</p>
//                     <p>Address: ${order.address}</p>
//                     <p>Phone Number: ${order.phoneNumber}</p>
//                     <p>Payment Method: ${order.paymentMethod}</p>
//                     <p>Status: ${status} ${status === 'Completed' ? '<i class="fas fa-check-circle"></i>' : status === 'Pending' ? '<i class="fas fa-hourglass-half"></i>' : '<i class="fas fa-times-circle"></i>'}</p>
//                     <p>Created At: ${new Date(order.createdAt).toLocaleString()}</p>
//                     <h4>Items:</h4>
//                     <ul>
//                         ${order.items
//                           .map(
//                             (item) => `
//                             <li>
//                                 ${item.productName} - $${item.productPrice} x ${item.productQuantity}
//                             </li>
//                         `,
//                           )
//                           .join('')}
//                      </ul>
//                     ${
//                       status === 'Pending'
//                         ? `
//                         <div class="order-actions">
//                             <button class="btn-delete" data-order-id="${order._id}">Delete Order</button>
//                             <button class="btn-done" data-order-id="${order._id}">Order Done</button>
//                         </div>
//                     `
//                         : ''
//                     }
//                 </li>
//             `,
//         )
//         .join('');
//     };

//     $('#completedOrders').html(renderOrders(completedOrders, 'Completed'));
//     $('#pendingOrders').html(renderOrders(pendingOrders, 'Pending'));
//     $('#canceledOrders').html(renderOrders(canceledOrders, 'Canceled'));

//     // Event listeners for buttons
//     $(document).on('click', '.btn-delete', function () {
//       const orderId = $(this).data('order-id');
//       $.ajax({
//         url: `/api/v1/order/admin/delete/${orderId}`,
//         type: 'DELETE',
//         success: function (response) {
//           alert('Order canceled successfully!');
//           // Optionally, refresh the order list
//           location.reload();
//         },
//         error: function () {
//           alert('Error canceling the order.');
//         },
//       });
//     });

//     $(document).on('click', '.btn-done', function () {
//       const orderId = $(this).data('order-id');
//       $.ajax({
//         url: `/api/v1/order/completeOrder/${orderId}`,
//         type: 'PATCH',
//         success: function (response) {
//           alert('Order marked as done successfully!');
//           // Optionally, refresh the order list
//           location.reload();
//         },
//         error: function () {
//           alert('Error marking the order as done.');
//         },
//       });
//     });
//   });
// });
