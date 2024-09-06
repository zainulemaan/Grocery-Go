$(document).ready(function () {
  $('#forgotPasswordForm').submit(function (event) {
    event.preventDefault(); // Prevent default form submission
    var formData = $(this).serialize(); // Serialize form data

    // Clear previous error messages
    $('#error-email').hide();
    $('.general-error-message').hide();
    $('.success-message').hide();

    $.ajax({
      type: 'POST',
      url: '/api/v1/users/forgotpassword',
      data: formData,
      success: function (response) {
        if (response.status === 'success') {
          console.log('Password reset token sent to email:', response.token);
          $('.success-message').text('Token sent to email!').show();

          // Store token in localStorage
          localStorage.setItem('resetToken', response.token);

          // Redirect to reset password page after 5 seconds
          setTimeout(function () {
            window.location.href = '/resetPassword';
          }, 2000);
        }
      },
      error: function (err) {
        console.error('Error sending password reset token:', err.responseText);

        // Check if the error response indicates email incorrect
        if (
          err.responseJSON &&
          err.responseJSON.message ===
            'There Is No User Exists With That Email Address.'
        ) {
          $('#error-email')
            .text('Email incorrect. Please enter a valid email address.')
            .show();
        } else {
          $('.general-error-message')
            .text('Error sending email. Try again later.')
            .show();
        }
      },
    });
  });
});

// $(document).ready(function () {
//   $('#forgotPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission
//     var formData = $(this).serialize(); // Serialize form data

//     $.ajax({
//       type: 'POST',
//       url: '/api/v1/users/forgotpassword',
//       data: formData,
//       success: function (response) {
//         if (response.status === 'success') {
//           console.log('Password reset token sent to email:', response.token);
//           $('.success-message').text('Token sent to email!').show();

//           // Store token in localStorage
//           localStorage.setItem('resetToken', response.token);

//           // Redirect to reset password page
//           window.location.href = '/resetPassword';
//         }
//       },
//       error: function (err) {
//         console.error('Error sending password reset token:', err.responseText);

//         // Check if the error response indicates email incorrect
//         if (
//           err.responseJSON &&
//           err.responseJSON.message ===
//             'There Is No User Exists With That Email Address.'
//         ) {
//           $('#email-error')
//             .text('Email incorrect. Please enter a valid email address.')
//             .show();
//         } else {
//           $('.general-error-message')
//             .text('Error sending email. Try again later.')
//             .show();
//         }
//       },
//     });
//   });
// });

// $(document).ready(function () {
//   $('#forgotPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission
//     var formData = $(this).serialize(); // Serialize form data

//     $.ajax({
//       type: 'POST',
//       url: '/api/v1/users/forgotpassword',
//       data: formData,
//       success: function (response) {
//         console.log('Password reset token sent to email:', response.token);
//         $('.success-message').text('Token sent to email!').show();

//         // Store token in localStorage
//         localStorage.setItem('resetToken', response.token);

//         // Redirect to reset password page
//         window.location.href = '/resetPassword';
//       },
//       error: function (err) {
//         console.error('Error sending password reset token:', err.responseText);
//         $('.general-error-message')
//           .text('Error sending email. Try again later.')
//           .show();
//       },
//     });
//   });
// });

// $(document).ready(function () {
//   $('#forgotPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission
//     var formData = $(this).serialize(); // Serialize form data

//     $.ajax({
//       type: 'POST',
//       url: '/api/v1/users/forgotpassword',
//       data: formData,
//       success: function (response) {
//         console.log('Password reset token sent to email');
//         console.log('Token:', response.token);
//         $('.success-message').text('Token sent to email!').show();

//         setTimeout(function () {
//           window.location.href = `/setresetPassword/${response.token}`;
//         }, 5000);
//       },
//       error: function (err) {
//         console.error('Error sending password reset token:', err.responseText);
//         $('.general-error-message')
//           .text('Error sending email. Try again later.')
//           .show();
//       },
//     });
//   });
// });

// // forgotpassword.js

// $(document).ready(function () {
//   $('#forgotPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission
//     var formData = $(this).serialize(); // Serialize form data

//     $.ajax({
//       type: 'POST',
//       url: '/api/v1/users/forgotpassword',
//       data: formData,
//       success: function (response) {
//         // Handle successful token sent (display success message)
//         console.log('Password reset token sent to email');
//         $('.success-message').text('Token sent to email!').show();

//         // Redirect to reset password page after 5 seconds
//         setTimeout(function () {
//           window.location.href = '/resetPassword'; // Replace with your actual reset password page URL
//         }, 5000); // 5000 milliseconds = 5 seconds
//       },
//       error: function (err) {
//         // Handle error (display error message)
//         console.error('Error sending password reset token:', err.responseText);
//         $('.general-error-message')
//           .text('Error sending email. Try again later.')
//           .show();
//       },
//     });
//   });
// });

// // forgotpassword.js

// $(document).ready(function () {
//   $('#forgotPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission
//     var formData = $(this).serialize(); // Serialize form data

//     $.ajax({
//       type: 'POST',
//       url: '/api/v1/users/forgotpassword',
//       data: formData,
//       success: function (response) {
//         // Handle successful token sent (display success message)
//         console.log('Password reset token sent to email');
//         $('.success-message').text('Token sent to email!').show();
//       },
//       error: function (err) {
//         // Handle error (display error message)
//         console.error('Error sending password reset token:', err.responseText);
//         $('.general-error-message')
//           .text('Error sending email. Try again later.')
//           .show();
//       },
//     });
//   });
// });
