// experienceReview.js

$(document).ready(function() {
    $('#experience-form').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        const rating = $('#rating').val();
        const feedback = $('#experience-text').val();

        if (!rating || !feedback.trim()) {
            alert('Please provide both a rating and your feedback.');
            return;
        }
        if (feedback.length < 8) {
            alert('Feedback must be at least 8 characters long.');
            return;
        }

        // Get JWT from cookies
        const token = document.cookie.split('; ').find(row => row.startsWith('jwt=')).split('=')[1];

        if (!token) {
            alert('User not authenticated.');
            return;
        }

        // Decode JWT to get userId
        const decoded = jwt_decode(token);
        const userId = decoded.id;

        $.ajax({
            url: `/api/v1/reviews/${userId}/createReview`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ rating: rating, review: feedback }),
            success: function(response) {
                alert('Your feedback has been submitted successfully.Thanks!');
                $('#experience-form')[0].reset(); // Reset the form fields
            },
            error: function(xhr) {
                console.error('Error submitting feedback:', xhr.responseText);

                // Parse the responseText to extract the error message
                let errorMessage = 'An unexpected error occurred. Please try again.';
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse.message) {
                        errorMessage = errorResponse.message;
                    }
                } catch (e) {
                    // If parsing fails, use a generic error message
                    console.error('Failed to parse error response:', e);
                }

                alert(`Error submitting feedback: ${errorMessage}`);
            }
        });
    });
});


// // // experienceReview.js

// $(document).ready(function() {
//     $('#experience-form').on('submit', function(e) {
//         e.preventDefault(); // Prevent the default form submission

//         const rating = $('#rating').val();
//         const feedback = $('#experience-text').val();

//         if (!rating || !feedback.trim()) {
//             alert('Please provide both a rating and your feedback.');
//             return;
//         }

//         // Get JWT from cookies
//         const token = document.cookie.split('; ').find(row => row.startsWith('jwt=')).split('=')[1];

//         if (!token) {
//             alert('User not authenticated.');
//             return;
//         }

//         // Decode JWT to get userId
//         const decoded = jwt_decode(token);
//         const userId = decoded.id;

//         $.ajax({
//             url: `/api/v1/reviews/${userId}/createReview`,
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ rating: rating, review: feedback }),
//             success: function(response) {
//                 alert('Your feedback has been submitted successfully.');
//                 $('#experience-form')[0].reset(); // Reset the form fields
//             },
//             error: function(error) {
//                 console.error('Error submitting feedback:', error);
//                 alert('You have already submitted the maximum number of reviews allowed.');
//             }
//         });
//     });
// });
