$(document).ready(function () {
  // Function to fetch personalized recommendations
  async function fetchRecommendations() {
    try {
      // Get the JWT token from cookies
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('jwt='))
        .split('=')[1];
      if (!token) {
        console.error('JWT token is missing');
        return;
      }

      // Decode the JWT token to get the userId
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.id;

      // Fetch recommendations from the API
      const response = await fetch('/api/v1/products/getPersonalizedProducts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();

      // Render recommendations
      const recommendationsContainer = $('.recommendations-container');
      if (data.status === 'success') {
        const products = data.data.products;
        let html = '';
        products.forEach((product) => {
          html += `
            <div class="product-card">
              <img class="product-image" src="/img/products/${product.photo}" alt="${product.name}">
              <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <div class="quantity">(${product.quantityAvailable})</div>
                <div class="price">
                  <div class="original-price">PKR ${product.price}</div>
                  ${product.discountPercentage ? `<div class="discounted-price">PKR ${(product.price - product.price * (product.discountPercentage / 100)).toFixed(2)}</div>` : ''}
                </div>
                <button class="add-to-cart" data-product-id="${product._id}">Add to Cart</button>
              </div>
            </div>
          `;
        });
        recommendationsContainer.html(html);
      } else {
        recommendationsContainer.html('<p>No recommendations available.</p>');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }

  // Function to get a cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Function to extract userId from JWT
  function getUserIdFromJwt(jwt) {
    try {
      const decoded = jwt_decode(jwt);
      return decoded.id;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  // Function to update cart count
  async function updateCartCount() {
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
        $('#cart-count').text(data.data.cartCount);
      } else {
        console.error('Failed to get cart count:', data.error);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  // Handle "Add to Cart" button click
  $(document).on('click', '.add-to-cart', async function () {
    const productId = $(this).data('product-id');
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

    // API request to add product to cart
    try {
      const response = await $.ajax({
        url: `/api/v1/cart/${userId}/addToCart`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
          Authorization: `Bearer ${jwtCookie}`,
        },
        data: JSON.stringify({ productId, productQuantity: 1 }),
      });

      if (response.status === 'success') {
        console.log('Product added to cart successfully!');
        updateCartCount(); // Update cart count after adding product
      } else {
        console.error('Failed to add product to cart:', response.error);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  });

  // Fetch recommendations and cart count on page load
  fetchRecommendations();
  updateCartCount();
});

// $(document).ready(function () {
//   // Function to fetch personalized recommendations
//   async function fetchRecommendations() {
//     try {
//       // Get the JWT token from cookies
//       const token = document.cookie
//         .split('; ')
//         .find((row) => row.startsWith('jwt='))
//         .split('=')[1];
//       if (!token) {
//         console.error('JWT token is missing');
//         return;
//       }

//       // Decode the JWT token to get the userId
//       const decodedToken = jwt_decode(token);
//       const userId = decodedToken.id;

//       // Fetch recommendations from the API
//       const response = await fetch('/api/v1/products/getPersonalizedProducts', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`, // Include the token in the request
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch recommendations');
//       }

//       const data = await response.json();

//       // Render recommendations
//       const recommendationsContainer = $('.recommendations-container');
//       if (data.status === 'success') {
//         const products = data.data.products;
//         let html = '';
//         products.forEach((product) => {
//           html += `
//                         <div class="product-card">
//                             <img class="product-image" src="/img/products/${product.photo}" alt="${product.name}">
//                             <div class="product-details">
//                                 <h3 class="product-name">${product.name}</h3>
//                                 <div class="quantity">(${product.quantityAvailable})</div>
//                                 <div class="price">
//                                     <div class="original-price">PKR ${product.price}</div>
//                                     ${product.discountPercentage ? `<div class="discounted-price">PKR ${(product.price - product.price * (product.discountPercentage / 100)).toFixed(2)}</div>` : ''}
//                                 </div>
//                                 <button class="add-to-cart" data-product-id="${product._id}">Add to Cart</button>
//                             </div>
//                         </div>
//                     `;
//         });
//         recommendationsContainer.html(html);
//       } else {
//         recommendationsContainer.html('<p>No recommendations available.</p>');
//       }
//     } catch (error) {
//       console.error('Error fetching recommendations:', error);
//     }
//   }

//   // Function to get a cookie by name
//   function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
//   }

//   // Function to extract userId from JWT
//   function getUserIdFromJwt(jwt) {
//     try {
//       const decoded = jwt_decode(jwt);
//       return decoded.id;
//     } catch (error) {
//       console.error('Failed to decode JWT:', error);
//       return null;
//     }
//   }

//   // Handle "Add to Cart" button click
//   $(document).on('click', '.add-to-cart', async function () {
//     const productId = $(this).data('product-id');
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

//     // API request to add product to cart
//     try {
//       const response = await $.ajax({
//         url: `/api/v1/cart/${userId}/addToCart`,
//         method: 'POST',
//         contentType: 'application/json',
//         headers: {
//           Authorization: `Bearer ${jwtCookie}`,
//         },
//         data: JSON.stringify({ productId, productQuantity: 1 }),
//       });

//       if (response.status === 'success') {
//         console.log('Product added to cart successfully!');
//       } else {
//         console.error('Failed to add product to cart:', response.error);
//       }
//     } catch (error) {
//       console.error('Error adding product to cart:', error);
//     }
//   });

//   // Fetch recommendations on page load
//   fetchRecommendations();
// });
