$(document).ready(function () {
  $('.search-form').on('submit', function (event) {
    event.preventDefault();
    const query = $('#search-input').val();

    if (!query.trim()) {
      alert('Please enter a search term');
      return;
    }

    $.ajax({
      url: `/api/v1/products/search`,
      method: 'GET',
      data: { query: query }, // Send query as a query parameter
      success: function (response) {
        const products = response.data.products;
        if (products.length > 0) {
          sessionStorage.setItem('searchResults', JSON.stringify(products));
          window.location.href = '/searchedProducts';
        } else {
          alert('No products found.');
        }
      },
      error: function (error) {
        console.error('Error fetching products:', error);
      },
    });
  });

  // Voice search functionality
  const voiceSearchButton = $('#voice-search-button')[0];
  const searchInput = $('#search-input')[0];

  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    voiceSearchButton.addEventListener('click', function () {
      recognition.start();
    });

    recognition.onresult = function (event) {
      const result = event.results[0][0].transcript;
      searchInput.value = result;
      $('.search-form').submit(); 
    };

    recognition.onerror = function (event) {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = function () {
      console.log('Speech recognition ended');
    };
  } else {
    voiceSearchButton.style.display = 'none'; 
  }
});


// $(document).ready(function () {
  
//   $('.search-form').on('submit', function (event) {
//     event.preventDefault(); 
//     const query = $('#search-input').val();

//     if (!query.trim()) {
//       alert('Please enter a search term');
//       return;
//     }

//     $.ajax({
//       url: `/api/v1/products/search/${encodeURIComponent(query)}`,
//       method: 'GET',
//       success: function (response) {
//         const products = response.data.products;
//         if (products.length > 0) {
//           sessionStorage.setItem('searchResults', JSON.stringify(products));
//           window.location.href = '/searchedProducts';
//         } else {
//           alert('No products found.');
//         }
//       },
//       error: function (error) {
//         console.error('Error fetching products:', error);
//       },
//     });
//   });

//   // Voice search functionality
//   const voiceSearchButton = $('#voice-search-button')[0];
//   const searchInput = $('#search-input')[0];

//   if ('webkitSpeechRecognition' in window) {
//     const recognition = new webkitSpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     voiceSearchButton.addEventListener('click', function () {
//       recognition.start();
//     });

//     recognition.onresult = function (event) {
//       const result = event.results[0][0].transcript;
//       searchInput.value = result;
//       $('.search-form').submit(); 
//     };

//     recognition.onerror = function (event) {
//       console.error('Speech recognition error:', event.error);
//     };

//     recognition.onend = function () {
//       console.log('Speech recognition ended');
//     };
//   } else {
//     voiceSearchButton.style.display = 'none'; 
//   }
// });

// $(document).ready(function () {
//     $('.search-form').on('submit', function (event) {
//       event.preventDefault(); // Prevent the default form submission
//       const query = $('#search-input').val();

//       if (!query.trim()) {
//         alert('Please enter a search term');
//         return;
//       }

//       $.ajax({
//         url: `/api/v1/products/search/${encodeURIComponent(query)}`,
//         method: 'GET',
//         success: function (response) {
//           // Assuming response.data.products is an array of product objects
//           const products = response.data.products;
//           if (products.length > 0) {
//             // Store the products in sessionStorage or localStorage
//             sessionStorage.setItem('searchResults', JSON.stringify(products));
//             window.location.href = '/searchedProducts';
//           } else {
//             alert('No products found.');
//           }
//         },
//         error: function (error) {
//           console.error('Error fetching products:', error);
//         },
//       });
//     });
//   });

// $(document).ready(function () {
//     $('.search-form').on('submit', function (event) {
//       event.preventDefault(); // Prevent the default form submission
//       const query = $('#search-input').val();

//       if (!query.trim()) {
//         alert('Please enter a search term');
//         return;
//       }

//       $.ajax({
//         url: `/api/v1/products/search/${encodeURIComponent(query)}`,
//         method: 'GET',
//         success: function (response) {
//           console.log('Search Results:', response);
//           // Add code to update the UI with the search results
//         },
//         error: function (error) {
//           console.error('Error fetching products:', error);
//         },
//       });
//     });
//   });
