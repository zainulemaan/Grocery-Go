// JavaScript for handling "Add to Wishlist" button click
$(document).ready(function () {
  // Event listener for add to wishlist button
  $('.products-container').on('click', '.add-to-wishlist', function () {
    const productId = $(this).data('product-id');
    const productQuantity = 1; // Set default quantity to 1

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

    // API request to add product to wishlist
    $.ajax({
      url: `/api/v1/wishlist/${userId}/createWishList`,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      data: JSON.stringify({ productId, productQuantity }), // Include productQuantity in the payload
      success: function (response) {
        if (response.status === 'success') {
          console.log('Product added to wishlist');
          // Optionally update UI or show confirmation message
        } else {
          console.error('Failed to add product to wishlist:', response.message);
        }
      },
      error: function (xhr) {
        console.error('Error:', xhr);
      },
    });
  });

  // Helper function to get JWT cookie
  function getCookie(name) {
    const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
    return cookieString ? cookieString[1] : null;
  }

  // Helper function to decode JWT and extract userId
  function getUserIdFromJwt(jwt) {
    try {
      const decoded = jwt_decode(jwt);
      return decoded.id;
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }
});
