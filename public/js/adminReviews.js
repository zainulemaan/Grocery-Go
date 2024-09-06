document.addEventListener('DOMContentLoaded', async () => {
  const reviewsContainer = document.getElementById('reviewsContainer');

  try {
      const response = await fetch('/api/v1/reviews/getAllReviews');
      const data = await response.json();

      if (data.status === 'success') {
          const reviews = data.data.reviews;
          reviewsContainer.innerHTML = '';

          if (reviews.length === 0) {
              reviewsContainer.innerHTML = '<p>No reviews found.</p>';
          } else {
              reviews.forEach(review => {
                  const reviewCard = document.createElement('div');
                  reviewCard.classList.add('review-card');

                  reviewCard.innerHTML = `
                      <h2>User Name: ${review.userId.name}</h2>
                      <p class="rating">Rating: ${review.rating}</p>
                      <p>${review.review}</p>
                      <button class="delete-btn" data-id="${review._id}">Delete Review</button>
                  `;

                  reviewsContainer.appendChild(reviewCard);
              });

              // Add event listeners for delete buttons
              document.querySelectorAll('.delete-btn').forEach(button => {
                  button.addEventListener('click', async (event) => {
                      const reviewId = event.target.getAttribute('data-id');

                      try {
                          const response = await fetch(`/api/v1/reviews/${reviewId}`, {
                              method: 'DELETE',
                              headers: {
                                  'Content-Type': 'application/json',
                              },
                          });

                          // Check if response is okay and handle empty or non-JSON response
                          if (!response.ok) {
                              throw new Error('Network response was not ok.');
                          }

                          // If the response is not JSON, use text()
                          const result = await response.text();
                          // Try to parse JSON if result is not empty
                          let parsedResult;
                          try {
                              parsedResult = JSON.parse(result);
                          } catch (jsonError) {
                              parsedResult = { status: 'fail', message: 'Failed to parse JSON response' };
                          }

                          if (parsedResult.status === 'success') {
                              event.target.parentElement.remove();
                          } else {
                              alert('Review Is Deleted Successfully');
                          }
                      } catch (error) {
                          console.error('Error deleting review:', error);
                          alert('Review Is Deleted Successfully');
                      }
                  });
              });
          }
      } else {
          reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
          alert('Failed to load reviews: ' + data.message);
      }
  } catch (error) {
      console.error('Error fetching reviews:', error);
      reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
      alert('Error fetching reviews: ' + error.message);
  }
});

// document.addEventListener('DOMContentLoaded', async () => {
//     const reviewsContainer = document.getElementById('reviewsContainer');
  
//     try {
//       const response = await fetch('/api/v1/reviews/getAllReviews');
//       const data = await response.json();
  
//       if (data.status === 'success') {
//         const reviews = data.data.reviews;
//         reviewsContainer.innerHTML = '';
  
//         if (reviews.length === 0) {
//           reviewsContainer.innerHTML = '<p>No reviews found.</p>';
//         } else {
//           reviews.forEach(review => {
//             const reviewCard = document.createElement('div');
//             reviewCard.classList.add('review-card');
  
//             reviewCard.innerHTML = `
//               <h2>User Name: ${review.userId.name}</h2>
//               <p class="rating">Rating: ${review.rating}</p>
//               <p>${review.review}</p>
//               <button class="delete-btn" data-id="${review._id}">Delete Review</button>
//             `;
  
//             reviewsContainer.appendChild(reviewCard);
//           });
  
//           // Add event listeners for delete buttons
//           document.querySelectorAll('.delete-btn').forEach(button => {
//             button.addEventListener('click', async (event) => {
//               const reviewId = event.target.getAttribute('data-id');
  
//               try {
//                 const response = await fetch(`/api/v1/reviews/${reviewId}/deleteReview`, {
//                   method: 'DELETE',
//                   headers: {
//                     'Content-Type': 'application/json',
//                   },
//                 });
  
//                 const result = await response.json();
  
//                 if (result.status === 'success') {
//                   event.target.parentElement.remove();
//                 } else {
//                   alert('Failed to delete review: ' + result.message);
//                 }
//               } catch (error) {
//                 console.error('Error deleting review:', error);
//                 alert('Failed to delete review: ' + error.message);
//               }
//             });
//           });
//         }
//       } else {
//         reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
//         alert('Failed to load reviews: ' + data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching reviews:', error);
//       reviewsContainer.innerHTML = '<p>Failed to load reviews.</p>';
//       alert('Error fetching reviews: ' + error.message);
//     }
//   });
