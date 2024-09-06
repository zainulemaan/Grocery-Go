$(document).ready(function () {
  // Function to fetch cart count
  async function fetchCartCount() {
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

    try {
      const response = await fetch(`/api/v1/cart/${userId}/getCartCount`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtCookie}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart count');
      }

      const data = await response.json();
      if (data.status === 'success') {
        $('#cart-count').text(data.data.cartCount); // Update cart count on the page
      } else {
        console.error('Failed to get cart count:', data.error);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  // Function to get JWT cookie
  function getCookie(name) {
    const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
    return cookieString ? cookieString[1] : null;
  }

  // Function to extract userId from JWT
  function getUserIdFromJwt(jwt) {
    try {
      const decoded = jwt_decode(jwt);
      return decoded.id;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Fetch cart count on page load
  fetchCartCount();

  // Handle "Add to Cart" button click
  $(document).on('click', '.add-to-cart', async function () {
    // After adding item to cart, fetch updated cart count
    await fetchCartCount();
  });

  // Polling to update cart count every 10 seconds
  setInterval(fetchCartCount, 1000); // 10000 milliseconds = 10 seconds
});

// $(document).ready(async function() {
//     // Function to fetch cart count
//     async function fetchCartCount() {
//         const jwtCookie = getCookie('jwt');

//         if (!jwtCookie) {
//             console.error('JWT not found in cookie.');
//             return;
//         }

//         const userId = getUserIdFromJwt(jwtCookie); // Extract userId from JWT

//         if (!userId) {
//             console.error('User ID not found in JWT.');
//             return;
//         }

//         try {
//             const response = await fetch(`/api/v1/cart/${userId}/getCartCount`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${jwtCookie}`
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch cart count');
//             }

//             const data = await response.json();
//             if (data.status === 'success') {
//                 $('#cart-count').text(data.data.cartCount); // Update cart count on the page
//             } else {
//                 console.error('Failed to fetch cart count:', data.error);
//             }
//         } catch (error) {
//             console.error('Error fetching cart count:', error);
//         }
//     }

//     // Function to get JWT cookie
//     function getCookie(name) {
//         const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
//         return cookieString ? cookieString[1] : null;
//     }

//     // Function to extract userId from JWT
//     function getUserIdFromJwt(jwt) {
//         try {
//             const decoded = jwt_decode(jwt);
//             return decoded.id;
//         } catch (error) {
//             console.error('Error decoding JWT:', error);
//             return null;
//         }
//     }

//     // Fetch cart count on page load
//     await fetchCartCount();

//     // Handle "Add to Cart" button click
//     $(document).on('click', '.add-to-cart', async function() {
//         const productId = $(this).data('product-id');
//         const jwtCookie = getCookie('jwt');

//         if (!jwtCookie) {
//             console.error('JWT not found in cookie.');
//             return;
//         }

//         const userId = getUserIdFromJwt(jwtCookie); // Extract userId from JWT

//         if (!userId) {
//             console.error('User ID not found in JWT.');
//             return;
//         }

//         try {
//             const addToCartResponse = await fetch(`/api/v1/cart/${userId}/addToCart`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${jwtCookie}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ productId, productQuantity: 1 })
//             });

//             if (!addToCartResponse.ok) {
//                 throw new Error('Failed to add product to cart');
//             }

//             const addToCartData = await addToCartResponse.json();
//             if (addToCartData.status === 'success') {
//                 console.log('Product added to cart successfully!');
//                 // Fetch updated cart count
//                 await fetchCartCount();
//             } else {
//                 console.error('Failed to add product to cart:', addToCartData.error);
//             }
//         } catch (error) {
//             console.error('Error adding product to cart:', error);
//         }
//     });
// });

// $(document).ready(async function () {
//   // Function to fetch cart count
//   async function fetchCartCount() {
//     const jwtCookie = getCookie('jwt');

//     if (!jwtCookie) {
//       console.error('JWT not found in cookie.');
//       return;
//     }

//     const userId = getUserIdFromJwt(jwtCookie); // Extract userId from JWT

//     if (!userId) {
//       console.error('User ID not found in JWT.');
//       return;
//     }

//     try {
//       const response = await fetch(`/api/v1/cart/${userId}/getCartCount`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${jwtCookie}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch cart count');
//       }

//       const data = await response.json();
//       if (data.status === 'success') {
//         $('#cart-count').text(data.data.cartCount); // Update cart count on the page
//       } else {
//         console.error('Failed to fetch cart count:', data.error);
//       }
//     } catch (error) {
//       console.error('Error fetching cart count:', error);
//     }
//   }

//   // Function to get JWT cookie
//   function getCookie(name) {
//     const cookieString = RegExp('' + name + '=([^;]*)').exec(document.cookie);
//     return cookieString ? cookieString[1] : null;
//   }

//   // Function to extract userId from JWT
//   function getUserIdFromJwt(jwt) {
//     try {
//       const decoded = jwt_decode(jwt);
//       return decoded.id;
//     } catch (error) {
//       console.error('Error decoding JWT:', error);
//       return null;
//     }
//   }

//   // Fetch cart count on page load
//   await fetchCartCount();
// });
