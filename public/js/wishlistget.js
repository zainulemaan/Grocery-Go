$(document).ready(function () {
  // Fetch userId from JWT token
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

  // Fetch wishlist from server
  $.ajax({
    url: `/api/v1/wishlist/${userId}/getWishList`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwtCookie}`,
    },
    success: function (response) {
      if (response.status === 'success') {
        const wishList = response.data;
        if (wishList.items.length === 0) {
          $('#wishlist-items').append('<li>No items in your wishlist.</li>');
        } else {
          wishList.items.forEach((item) => {
            $('#wishlist-items').append(`
              <li>
                <div class="wishlist-item">
                  <img src="/img/products/${item.productPhoto}" alt="${item.productName}" class="wishlist-item-image" />
                  <div class="wishlist-item-details">
                    <h2 class="wishlist-item-name">${item.productName}</h2>
                    <p class="wishlist-item-price">PKR ${item.productPrice.toFixed(2)}</p>
                    <p class="wishlist-item-quantity">Quantity: ${item.productQuantity}</p>
                    <button class="add-to-cart" data-product-id="${item.productId}" data-product-quantity="${item.productQuantity}">Add to Cart</button>
                  </div>
                </div>
              </li>
            `);
          });

          // Attach click event handler to "Add to Cart" buttons
          $('.add-to-cart').on('click', function () {
            const productId = $(this).data('product-id');
            const productQuantity = $(this).data('product-quantity'); // Use the data-product-quantity from the button
            addToCart(productId, productQuantity);
          });
        }
      } else {
        console.error('Failed to fetch wishlist:', response.message);
      }
    },
    error: function (xhr) {
      console.error('Error:', xhr);
    },
  });

  // Function to add product to cart
  function addToCart(productId, productQuantity) {
    if (!productId) {
      console.error('Product ID is undefined.');
      return;
    }

    $.ajax({
      url: `/api/v1/cart/${userId}/addToCart`,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      data: JSON.stringify({ productId, productQuantity }),
      success: function (response) {
        if (response.status === 'success') {
          console.log('Product added to cart successfully!');
          // Handle success message or action
        } else {
          console.error('Failed to add product to cart:', response.error);
          // Handle failure message or action
        }
      },
      error: function (xhr) {
        console.error('Error adding product to cart:', xhr);
        // Handle error message or action
      },
    });
  }

  // Function to clear wishlist
  function clearWishList() {
    $.ajax({
      url: `/api/v1/wishlist/${userId}/wishlist/clear`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwtCookie}`,
      },
      success: function (response) {
        if (response.status === 'success') {
          console.log('Wishlist cleared successfully!');
          // Clear wishlist items from the UI
          $('#wishlist-items').empty();
          $('#wishlist-items').append('<li>No items in your wishlist.</li>');
        } else {
          console.error('Failed to clear wishlist:', response.message);
        }
      },
      error: function (xhr) {
        console.error('Error:', xhr);
      },
    });
  }

  // Attach click event handler to "Clear Wishlist" button
  $(document).on('click', '#clear-wishlist', function () {
    clearWishList();
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


// $(document).ready(function () {
//   // Fetch userId from JWT token
//   const jwtCookie = getCookie('jwt');
//   if (!jwtCookie) {
//     console.error('JWT not found in cookie.');
//     return;
//   }

//   const userId = getUserIdFromJwt(jwtCookie);

//   if (!userId) {
//     console.error('User ID not found in JWT.');
//     return;
//   }

//   // Fetch wishlist from server
//   $.ajax({
//     url: `/api/v1/wishlist/${userId}/getWishList`,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${jwtCookie}`,
//     },
//     success: function (response) {
//       if (response.status === 'success') {
//         const wishList = response.data;
//         if (wishList.items.length === 0) {
//           $('#wishlist-items').append('<li>No items in your wishlist.</li>');
//         } else {
//           wishList.items.forEach((item) => {
//             $('#wishlist-items').append(`
//               <li>
//                 <div class="wishlist-item">
//                   <img src="/img/products/${item.productPhoto}" alt="${item.productName}" class="wishlist-item-image" />
//                   <div class="wishlist-item-details">
//                     <h2 class="wishlist-item-name">${item.productName}</h2>
//                     <p class="wishlist-item-price">PKR ${item.productPrice.toFixed(2)}</p>
//                     <p class="wishlist-item-quantity">Quantity: ${item.productQuantity}</p>
//                     <button class="add-to-cart" data-product-id="${item.productId}" data-product-quantity="${item.productQuantity}">Add to Cart</button>
//                   </div>
//                 </div>
//               </li>
//             `);
//           });

//           // Attach click event handler to "Add to Cart" buttons
//           $('.add-to-cart').on('click', function () {
//             const productId = $(this).data('product-id');
//             const productQuantity = $(this).data('product-quantity'); // Use the data-product-quantity from the button
//             addToCart(productId, productQuantity);
//           });
//         }
//       } else {
//         console.error('Failed to fetch wishlist:', response.message);
//       }
//     },
//     error: function (xhr) {
//       console.error('Error:', xhr);
//     },
//   });

//   // Function to add product to cart
//   function addToCart(productId, productQuantity) {
//     if (!productId) {
//       console.error('Product ID is undefined.');
//       return;
//     }

//     $.ajax({
//       url: `/api/v1/cart/${userId}/addToCart`,
//       method: 'POST',
//       contentType: 'application/json',
//       headers: {
//         Authorization: `Bearer ${jwtCookie}`,
//       },
//       data: JSON.stringify({ productId, productQuantity }),
//       success: function (response) {
//         if (response.status === 'success') {
//           console.log('Product added to cart successfully!');
//           // Handle success message or action
//         } else {
//           console.error('Failed to add product to cart:', response.error);
//           // Handle failure message or action
//         }
//       },
//       error: function (xhr) {
//         console.error('Error adding product to cart:', xhr);
//         // Handle error message or action
//       },
//     });
//   }

//   // Helper function to get JWT cookie
//   function getCookie(name) {
//     const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
//     return cookieString ? cookieString[1] : null;
//   }

//   // Helper function to decode JWT and extract userId
//   function getUserIdFromJwt(jwt) {
//     try {
//       const decoded = jwt_decode(jwt);
//       return decoded.id;
//     } catch (e) {
//       console.error('Error decoding JWT:', e);
//       return null;
//     }
//   }
// });

// $(document).ready(function () {
//   // Fetch userId from JWT token
//   const jwtCookie = getCookie('jwt');
//   if (!jwtCookie) {
//     console.error('JWT not found in cookie.');
//     return;
//   }

//   const userId = getUserIdFromJwt(jwtCookie);

//   if (!userId) {
//     console.error('User ID not found in JWT.');
//     return;
//   }

//   // Fetch wishlist from server
//   $.ajax({
//     url: `/api/v1/wishlist/${userId}/getWishList`,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${jwtCookie}`,
//     },
//     success: function (response) {
//       if (response.status === 'success') {
//         const wishList = response.data;
//         if (wishList.items.length === 0) {
//           $('#wishlist-items').append('<li>No items in your wishlist.</li>');
//         } else {
//           wishList.items.forEach((item) => {
//             $('#wishlist-items').append(`
//                 <li>
//                   <div class="wishlist-item">
//                     <img src="/img/products/${item.productPhoto}" alt="${item.productName}" class="wishlist-item-image" />
//                     <div class="wishlist-item-details">
//                       <h2 class="wishlist-item-name">${item.productName}</h2>
//                       <p class="wishlist-item-price">PKR ${item.productPrice.toFixed(2)}</p>

//                     </div>
//                   </div>
//                 </li>
//               `);
//           });
//         }
//       } else {
//         console.error('Failed to fetch wishlist:', response.message);
//       }
//     },
//     error: function (xhr) {
//       console.error('Error:', xhr);
//     },
//   });

//   // Helper function to get JWT cookie
//   function getCookie(name) {
//     const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
//     return cookieString ? cookieString[1] : null;
//   }

//   // Helper function to decode JWT and extract userId
//   function getUserIdFromJwt(jwt) {
//     try {
//       const decoded = jwt_decode(jwt);
//       return decoded.id;
//     } catch (e) {
//       console.error('Error decoding JWT:', e);
//       return null;
//     }
//   }
// });
