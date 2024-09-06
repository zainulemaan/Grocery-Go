// $(document).ready(function () {
//   // AJAX form submission for deleting a product
//   $('#deleteForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     var productId = $('#productId').val(); // Get selected product ID

//     $.ajax({
//       url: '/api/v1/products/' + productId,
//       type: 'DELETE',
//       success: function (response) {
//         console.log(response); // Log the response for debugging

//         if (response.status === 'success') {
//           // Show success message to user
//           $('.form-message')
//             .text('Product deleted successfully!')
//             .css('color', 'green')
//             .show();
//         } else {
//           // Show error message to user if needed
//           $('.form-message')
//             .text('Failed to delete product. Please try again.')
//             .css('color', 'red')
//             .show();
//         }
//       },
//       error: function (xhr, status, error) {
//         console.error(xhr.responseText); // Log detailed error message
//         $('.form-message')
//           .text('Failed to delete product. Please try again.')
//           .css('color', 'red')
//           .show();
//       },
//     });
//   });
// });

// $(document).ready(function () {
//   // AJAX form submission for deleting a product
//   $('#deleteForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     var productId = $('#productId').val(); // Get selected product ID from dropdown

//     $.ajax({
//       url: '/api/v1/products/' + productId,
//       type: 'DELETE',
//       success: function (response) {
//         console.log(response); // Log response for debugging

//         if (response.status === 'success') {
//           // Show success message to user
//           $('.form-message')
//             .text('Product deleted successfully!')
//             .removeClass('error')
//             .addClass('success')
//             .show();
//         } else {
//           // Show error message to user if needed
//           $('.form-message')
//             .text('Failed to delete product. Please try again.')
//             .removeClass('success')
//             .addClass('error')
//             .show();
//         }
//       },
//       error: function (xhr, status, error) {
//         console.error(xhr.responseText); // Log detailed error message
//         $('.form-message')
//           .text('Failed to delete product. Please try again.')
//           .removeClass('success')
//           .addClass('error')
//           .show();
//       },
//     });
//   });
// });
