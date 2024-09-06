// Assuming you have a button with id="addToCartButton" and fields for productId and productQuantity
$('.add-to-cart').click(function (e) {
  e.preventDefault(); // Prevent default form submission

  // Fetch productId and productQuantity from your form or wherever they are stored
  const productId = $('#productId').val();
  const productQuantity = $('#productQuantity').val();
  const userId = '668d3228b89af5b2e2cfa334'; // Replace with actual userId

  // Make AJAX request to add item to cart
  $.ajax({
    url: `/api/v1/cart/${userId}/addToCart`,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ productId, productQuantity }),
    success: function (response) {
      // Handle success response
      console.log('Item added to cart:', response);
      // You can update UI or show a success message here
    },
    error: function (xhr, status, error) {
      // Handle error response
      console.error('Error adding item to cart:', error);
      // Display an error message or handle the error as needed
    },
  });
});
