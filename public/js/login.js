$(document).ready(function () {
  // Function to validate email
  function validateEmail() {
    const email = $('#email').val();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError = $('#email-error');
    if (!email) {
      emailError.text('Email is required');
    } else if (!emailPattern.test(email)) {
      emailError.text('Please enter a valid email address');
    } else {
      emailError.text('');
    }
  }

  // Function to validate password
  function validatePassword() {
    const password = $('#password').val();
    const passwordError = $('#password-error');
    if (!password) {
      passwordError.text('Password is required');
    } else {
      passwordError.text('');
    }
  }

  // Attach event listeners to input fields
  $('#email').on('input', validateEmail);
  $('#password').on('input', validatePassword);

  // Submit login form via AJAX
  $('#loginForm').submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    // Clear previous messages
    $('#email-error').text('');
    $('#password-error').text('');
    $('.general-error-message').hide();
    $('.success-message').hide();

    validateEmail();
    validatePassword();

    if (!$('#email-error').text() && !$('#password-error').text()) {
      $.ajax({
        url: '/api/v1/users/login',
        type: 'POST',
        data: $(this).serialize(), // Serialize form data
        success: function (response) {
          console.log(response); // Log the response for debugging

          if (response.status === 'success') {
            const role = response.data.user.role; // Get role from response data

            // Show a success message and redirect based on role
            if (role === 'admin') {
              $('.success-message')
                .html(
                  'Login successful! <a href="/dashboard">Open Dashboard</a>',
                )
                .css('color', 'green')
                .show();
            } else {
              $('.success-message')
                .html('Login successful! Redirecting to products...')
                .css('color', 'green')
                .show();
              setTimeout(function () {
                window.location.href = '/products'; // Redirect to products page
              }, 2000); // Redirect after 2 seconds
            }

            // Debugging: Log JWT cookie
            const jwtCookie = getCookie('jwt');
            console.log('JWT Cookie after login:', jwtCookie);

            if (jwtCookie) {
              $.ajaxSetup({
                headers: {
                  Authorization: `Bearer ${jwtCookie}`,
                },
              });
            }
          } else {
            // Show general error message if login is not successful
            $('.general-error-message').show();
          }
        },
        error: function (xhr) {
          // Handle error
          $('.general-error-message').show();
        },
      });
    }
  });

  // Display success message if redirected with a message parameter
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  if (message) {
    $('.success-message').text(message).show();
  }

  // Function to get cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Debugging: Log JWT cookie on page load
  const jwtCookie = getCookie('jwt');
  console.log('JWT Cookie on page load:', jwtCookie);
});

// $(document).ready(function () {
//   // Function to validate email
//   function validateEmail() {
//     const email = $('#email').val();
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const emailError = $('#email-error');
//     if (!email) {
//       emailError.text('Email is required');
//     } else if (!emailPattern.test(email)) {
//       emailError.text('Please enter a valid email address');
//     } else {
//       emailError.text('');
//     }
//   }

//   // Function to validate password
//   function validatePassword() {
//     const password = $('#password').val();
//     const passwordError = $('#password-error');
//     if (!password) {
//       passwordError.text('Password is required');
//     } else {
//       passwordError.text('');
//     }
//   }

//   // Attach event listeners to input fields
//   $('#email').on('input', validateEmail);
//   $('#password').on('input', validatePassword);

//   // Submit login form via AJAX
//   $('#loginForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Clear previous messages
//     $('#email-error').text('');
//     $('#password-error').text('');
//     $('.general-error-message').hide();
//     $('.success-message').hide();

//     validateEmail();
//     validatePassword();

//     if (!$('#email-error').text() && !$('#password-error').text()) {
//       $.ajax({
//         url: '/api/v1/users/login',
//         type: 'POST',
//         data: $(this).serialize(), // Serialize form data
//         success: function (response) {
//           console.log(response); // Log the response for debugging

//           if (response.status === 'success') {
//             const role = response.data.user.role; // Get role from response data

//             // Show a success message and redirect based on role
//             if (role === 'admin') {
//               $('.success-message')
//                 .html(
//                   'Login successful! <a href="/dashboard">Open Dashboard</a>',
//                 )
//                 .css('color', 'green')
//                 .show();
//             } else {
//               $('.success-message')
//                 .html('Login successful! Redirecting to products...')
//                 .css('color', 'green')
//                 .show();
//               setTimeout(function () {
//                 window.location.href = '/products'; // Redirect to products page
//               }, 2000); // Redirect after 2 seconds
//             }

//             // Set JWT cookie for subsequent requests
//             const jwtCookie = getCookie('jwt');
//             if (jwtCookie) {
//               $.ajaxSetup({
//                 headers: {
//                   Authorization: `Bearer ${jwtCookie}`,
//                 },
//               });
//             }
//           } else {
//             // Show general error message if login is not successful
//             $('.general-error-message').show();
//           }
//         },
//         error: function (xhr) {
//           // Handle error
//           $('.general-error-message').show();
//         },
//       });
//     }
//   });

//   // Display success message if redirected with a message parameter
//   const urlParams = new URLSearchParams(window.location.search);
//   const message = urlParams.get('message');
//   if (message) {
//     $('.success-message').text(message).show();
//   }

//   // Function to get cookie by name
//   function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
//   }
// });

// $(document).ready(function () {
//   // Function to validate email
//   function validateEmail() {
//     const email = $('#email').val();
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const emailError = $('#email-error');
//     if (!email) {
//       emailError.text('Email is required');
//     } else if (!emailPattern.test(email)) {
//       emailError.text('Please enter a valid email address');
//     } else {
//       emailError.text('');
//     }
//   }

//   // Function to validate password
//   function validatePassword() {
//     const password = $('#password').val();
//     const passwordError = $('#password-error');
//     if (!password) {
//       passwordError.text('Password is required');
//     } else {
//       passwordError.text('');
//     }
//   }

//   // Attach event listeners to input fields
//   $('#email').on('input', validateEmail);
//   $('#password').on('input', validatePassword);

//   // Submit login form via AJAX
//   $('#loginForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Clear previous messages
//     $('#email-error').text('');
//     $('#password-error').text('');
//     $('.general-error-message').hide();
//     $('.success-message').hide();

//     validateEmail();
//     validatePassword();

//     if (!$('#email-error').text() && !$('#password-error').text()) {
//       $.ajax({
//         url: '/api/v1/users/login',
//         type: 'POST',
//         data: $(this).serialize(), // Serialize form data
//         success: function (response) {
//           console.log(response); // Log the response for debugging

//           if (response.status === 'success') {
//             const role = response.data.user.role; // Get role from response data

//             // Show a success message and redirect based on role
//             if (role === 'admin') {
//               $('.success-message')
//                 .html(
//                   'Login successful! <a href="/dashboard">Open Dashboard</a>',
//                 )
//                 .css('color', 'green')
//                 .show();
//             } else {
//               $('.success-message')
//                 .html('Login successful! Redirecting to products...')
//                 .css('color', 'green')
//                 .show();
//               setTimeout(function () {
//                 window.location.href = '/products'; // Redirect to products page
//               }, 2000); // Redirect after 2 seconds
//             }
//           } else {
//             // Show general error message if login is not successful
//             $('.general-error-message').show();
//           }
//         },
//         error: function (xhr) {
//           // Handle error
//           $('.general-error-message').show();
//         },
//       });
//     }
//   });

//   // Display success message if redirected with a message parameter
//   const urlParams = new URLSearchParams(window.location.search);
//   const message = urlParams.get('message');
//   if (message) {
//     $('.success-message').text(message).show();
//   }
// });
