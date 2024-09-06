$(document).ready(function () {
  $('#resetPasswordForm').submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    var resetToken = localStorage.getItem('resetToken'); // Retrieve token from localStorage

    // Get passwords from input fields
    var password = $('#password').val();
    var confirmPassword = $('#confirmPassword').val();

    // Validate passwords (ensure they match)
    if (password !== confirmPassword) {
      $('#confirmPassword-error').text('Passwords do not match').show();
      return; // Exit if passwords don't match
    } else {
      $('#confirmPassword-error').hide();
    }

    // Validate password length
    if (password.length < 8) {
      $('.general-error-message')
        .text('Password should be at least 8 characters long.')
        .show();
      return; // Exit if password is too short
    } else {
      $('.general-error-message').hide();
    }

    // Prepare form data
    var formData = {
      password: password,
      confirmPassword: confirmPassword,
    };

    // AJAX request to reset password
    $.ajax({
      type: 'PATCH',
      url: `/api/v1/users/resetPassword/${resetToken}`,
      data: formData,
      success: function (response) {
        console.log('Password reset successful');
        $('.success-message')
          .text(
            'Password reset successful. You can now login with your new password.',
          )
          .show();

        // Show toast message
        showToast('Password Reset Successful');

        setTimeout(function () {
          window.location.href = '/login'; // Redirect to login page after reset
        }, 2000);
      },
      error: function (err) {
        console.error('Error resetting password:', err.responseText);
        $('.general-error-message')
          .text('Error resetting password. Try again later.')
          .show();
      },
      complete: function () {
        localStorage.removeItem('resetToken'); // Remove token from localStorage after use
      },
    });
  });

  // Function to show toast message
  function showToast(message) {
    // Create toast element
    var toast = $(
      '<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000"></div>',
    );
    toast.text(message);
    $('.toast-container').append(toast);

    // Show toast with Bootstrap
    var toastElList = [].slice.call(document.querySelectorAll('.toast'));
    var toastList = toastElList.map(function (toastEl) {
      return new bootstrap.Toast(toastEl);
    });
    toastList.forEach(function (toast) {
      toast.show();
    });
  }
});

// $(document).ready(function () {
//   $('#resetPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     var resetToken = localStorage.getItem('resetToken'); // Retrieve token from localStorage

//     // Get passwords from input fields
//     var password = $('#password').val();
//     var confirmPassword = $('#confirmPassword').val();

//     // Validate passwords (ensure they match)
//     if (password !== confirmPassword) {
//       $('#confirmPassword-error').text('Passwords do not match').show();
//       return; // Exit if passwords don't match
//     } else {
//       $('#confirmPassword-error').hide();
//     }

//     // Prepare form data
//     var formData = {
//       password: password,
//       confirmPassword: confirmPassword,
//     };

//     // AJAX request to reset password
//     $.ajax({
//       type: 'PATCH',
//       url: `/api/v1/users/resetPassword/${resetToken}`,
//       data: formData,
//       success: function (response) {
//         console.log('Password reset successful');
//         $('.success-message')
//           .text(
//             'Password reset successful. You can now login with your new password.',
//           )
//           .show();

//         setTimeout(function () {
//           window.location.href = '/login'; // Redirect to login page after reset
//         }, 5000);
//       },
//       error: function (err) {
//         console.error('Error resetting password:', err.responseText);
//         $('.general-error-message')
//           .text('Error resetting password. Try again later.')
//           .show();
//       },
//       complete: function () {
//         localStorage.removeItem('resetToken'); // Remove token from localStorage after use
//       },
//     });
//   });
// });

// $(document).ready(function () {
//   $('#resetPasswordForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     var resetToken = $(this).data('reset-token'); // Retrieve reset token from data attribute

//     console.log('Reset Token:', resetToken); // Debug: Output the token to the console

//     // Get passwords from input fields
//     var password = $('#password').val();
//     var confirmPassword = $('#confirmPassword').val();

//     // Validate passwords
//     if (password !== confirmPassword) {
//       $('#confirmPassword-error').text('Passwords do not match').show();
//       return; // Exit if passwords don't match
//     } else {
//       $('#confirmPassword-error').hide();
//     }

//     // Prepare form data
//     var formData = {
//       password: password,
//       confirmPassword: confirmPassword,
//     };

//     $.ajax({
//       type: 'PATCH',
//       url: '/api/v1/users/resetPassword/' + resetToken,
//       data: formData,
//       success: function (response) {
//         console.log('Password reset successful');
//         $('.success-message')
//           .text(
//             'Password reset successful. You can now login with your new password.',
//           )
//           .show();

//         setTimeout(function () {
//           window.location.href = '/login';
//         }, 5000);
//       },
//       error: function (err) {
//         console.error('Error resetting password:', err.responseText);
//         $('.general-error-message')
//           .text('Error resetting password. Try again later.')
//           .show();
//       },
//     });
//   });
// });
