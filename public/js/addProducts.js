
$(document).ready(function () {
  // Helper function to show or hide error messages
  function toggleError(element, message) {
    const $errorSpan = element.next('.error-message');
    if (message) {
      element.css('border-color', 'red');
      $errorSpan.text(message).show();
    } else {
      element.css('border-color', '');
      $errorSpan.hide();
    }
  }

  // Validation functions
  function validateField(selector, condition, message) {
    $(selector).on('input change', function () {
      toggleError($(this), condition($(this).val()) ? message : '');
    });
  }

  // Setup validation rules
  validateField(
    '#name',
    (val) => val.trim() === '',
    'Product name is required.',
  );

  validateField('#brand', (val) => val.trim() === '', 'Brand is required.');

  validateField(
    '#price',
    (val) => val <= 0 || isNaN(val),
    'Price must be a number greater than zero.',
  );

  validateField(
    '#quantityAvailable',
    (val) => val <= 0 || isNaN(val),
    'Quantity must be greater than zero.',
  );

  validateField(
    '#description',
    (val) => val.trim() === '',
    'Description is required.',
  );

  validateField('#category', (val) => val === '', 'Category is required.');

  validateField('#size', (val) => val === '', 'Size is required.');

  validateField('#photo', (val) => val === '', 'Photo is required.');

  validateField(
    '#expiryDate',
    (val) => new Date(val) < new Date(),
    'Expiry date cannot be in the past.',
  );

  validateField(
    '#discountPercentage',
    (val) => val < 0 || val > 100 || isNaN(val),
    'Discount percentage must be between 0 and 100.',
  );

  // Form submit handler
  $('#addProductForm').submit(function (event) {
    event.preventDefault();
    if ($('.error-message:visible').length === 0) {
      var formData = new FormData(this);
      var token = localStorage.getItem('token');
      $.ajax({
        url: $(this).attr('action'),
        type: 'POST',
        data: formData,
        headers: {
          Authorization: 'Bearer ' + token,
        },
        contentType: false,
        processData: false,
        success: function (response) {
          if (response.status === 'success') {
            $('body').append(`
              <div id="success-card" class="success-card">
                  <i class="fa fa-check-circle"></i> Product Added Successfully!
              </div>
          `);
            // Show the success card
            $('#success-card').fadeIn().delay(1000).fadeOut();
          } else {
            $('body').append(`
              <div id="cancel-card" class="cancel-card">
                  <i class="fa fa-check-xmark"></i> Failed to create product. Please try again!
              </div>
          `);
            // Show the success card
            $('#cancel-card').fadeIn().delay(1000).fadeOut();

            //   $('.form-message')
            //     .text('Product created successfully!')
            //     .css('color', 'green')
            //     .show();
            // } else {
            //   $('.form-message')
            //     .text('Failed to create product. Please try again.')
            //     .css('color', 'red')
            //     .show();
          }
        },
        error: function () {
          $('body').append(`
            <div id="cancel-card" class="cancel-card">
                <i class="fa fa-check-xmark"></i> Failed to create product. Please try again!
            </div>
        `);
          // Show the success card
          $('#cancel-card').fadeIn().delay(1000).fadeOut();
          // $('.form-message')
          //   .text('Failed to create product. Please try again.')
          //   .css('color', 'red')
          //   .show();
        },
      });
    } else {
      $('body').append(`
        <div id="cancel-card" class="cancel-card">
            <i class="fa fa-check-xmark"></i> Please fix the errors in the form before submitting.
        </div>
    `);
      // Show the success card
      $('#cancel-card').fadeIn().delay(1000).fadeOut();
      // $('.form-message')
      //   .text('Please fix the errors in the form before submitting.')
      //   .css('color', 'red')
      //   .show();
    }
  });

  // Back to dashboard button handler
  $('#backToDashboardBtn').click(function (event) {
    event.preventDefault();
    window.location.href = '/dashboard';
  });
});

// $(document).ready(function () {
//   // Function to validate individual fields
//   function validateField(selector, condition, message) {
//     $(selector).on('input change', function () {
//       if (condition($(this).val())) {
//         $(this).css('border-color', 'red');
//         $(this).next('.error-message').text(message).show();
//       } else {
//         $(this).css('border-color', '');
//         $(this).next('.error-message').hide();
//       }
//     });
//   }

//   // Validate Product Name
//   validateField(
//     '#name',
//     (val) => val.trim() === '',
//     'Product name is required.'
//   );

//   // Validate Brand
//   validateField(
//     '#brand',
//     (val) => val.trim() === '',
//     'Brand is required.'
//   );

//   // Validate Price
//   validateField(
//     '#price',
//     (val) => val <= 0 || isNaN(val),
//     'Price must be a number greater than zero.'
//   );

//   // Validate Quantity
//   validateField(
//     '#quantity',
//     (val) => val <= 1 || isNaN(val),
//     'Quantity must be greater than 1.'
//   );

//   // Validate Category
//   validateField(
//     '#category',
//     (val) => val === '',
//     'Category is required.'
//   );

//   // Validate Size
//   validateField(
//     '#size',
//     (val) => val === '',
//     'Size is required.'
//   );

//   // Validate Photo
//   validateField(
//     '#photo',
//     (val) => val === '',
//     'Photo is required.'
//   );

//   // Validate Expiry Date
//   validateField(
//     '#expiryDate',
//     (val) => new Date(val) < new Date(),
//     'Expiry date cannot be in the past.'
//   );

//   // Validate Discount Percentage
//   validateField(
//     '#discount',
//     (val) => val < 1 || val > 99 || isNaN(val),
//     'Discount percentage must be between 1% and 99%.'
//   );

//   // Function to validate the entire form before submission
//   function validateForm() {
//     let hasError = false;
//     // Validate each field again before form submission
//     $('input, select').each(function () {
//       const condition = $(this).data('condition');
//       const message = $(this).data('message');
//       if (condition && message && condition($(this).val())) {
//         $(this).css('border-color', 'red');
//         $(this).next('.error-message').text(message).show();
//         hasError = true;
//       }
//     });

//     return !hasError;
//   }

//   // AJAX form submission for adding a product
//   $('#addProductForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Perform the final validation check
//     if (!validateForm()) {
//       $('.form-message')
//         .text('Please fix the errors in the form before submitting.')
//         .css('color', 'red')
//         .show();
//       return; // Stop the form submission
//     }

//     var formData = new FormData(this); // Create FormData object to send form data including files

//     // Fetch the token from local storage
//     var token = localStorage.getItem('token');

//     $.ajax({
//       url: '/api/v1/products',
//       type: 'POST',
//       data: formData,
//       headers: {
//         Authorization: 'Bearer ' + token, // Include the token in the request headers
//       },
//       contentType: false, // Important! Don't set contentType
//       processData: false, // Important! Don't process the data
//       success: function (response) {
//         console.log(response); // Log the response for debugging

//         if (response.status === 'success') {
//           // Show success message to user
//           $('.form-message')
//             .text('Product created successfully!')
//             .css('color', 'green')
//             .show();
//         } else {
//           // Show error message to user if needed
//           $('.form-message')
//             .text('Failed to create product. Please try again.')
//             .css('color', 'red')
//             .show();
//         }
//       },
//       error: function (xhr, status, error) {
//         console.error(xhr.responseText); // Log detailed error message
//         $('.form-message')
//           .text('Failed to create product. Please try again.')
//           .css('color', 'red')
//           .show();
//       }
//     });
//   });

//   // Redirect to dashboard on button click
//   $('#backToDashboardBtn').click(function (event) {
//     event.preventDefault(); // Prevent default link behavior if needed

//     // Redirect to the dashboard page
//     window.location.href = '/dashboard';
//   });

//   // Attach conditions and messages to fields for final validation check
//   $('#name')
//     .data('condition', (val) => val.trim() === '')
//     .data('message', 'Product name is required.');
//   $('#brand')
//     .data('condition', (val) => val.trim() === '')
//     .data('message', 'Brand is required.');
//   $('#price')
//     .data('condition', (val) => val <= 0 || isNaN(val))
//     .data('message', 'Price must be a number greater than zero.');
//   $('#quantity')
//     .data('condition', (val) => val <= 1 || isNaN(val))
//     .data('message', 'Quantity must be greater than 1.');
//   $('#category')
//     .data('condition', (val) => val === '')
//     .data('message', 'Category is required.');
//   $('#size')
//     .data('condition', (val) => val === '')
//     .data('message', 'Size is required.');
//   $('#photo')
//     .data('condition', (val) => val === '')
//     .data('message', 'Photo is required.');
//   $('#expiryDate')
//     .data('condition', (val) => new Date(val) < new Date())
//     .data('message', 'Expiry date cannot be in the past.');
//   $('#discount')
//     .data('condition', (val) => val < 1 || val > 99 || isNaN(val))
//     .data('message', 'Discount percentage must be between 1% and 99%.');
// });

// $(document).ready(function () {
//   // Function to validate form fields
//   function validateField(selector, condition, message) {
//     $(selector).on('input change', function () {
//       if (condition($(this).val())) {
//         $(this).css('border-color', 'red');
//         $(this).next('.error-message').text(message).show();
//       } else {
//         $(this).css('border-color', '');
//         $(this).next('.error-message').hide();
//       }
//     });
//   }

//   // Validate Product Name
//   validateField(
//     '#name',
//     (val) => val.trim() === '',
//     'Product name is required.',
//   );

//   // Validate Brand
//   validateField('#brand', (val) => val.trim() === '', 'Brand is required.');

//   // Validate Price
//   validateField(
//     '#price',
//     (val) => val <= 0,
//     'Price must be greater than zero.',
//   );

//   // Validate Category
//   validateField('#category', (val) => val === '', 'Category is required.');

//   // Validate Size
//   validateField('#size', (val) => val === '', 'Size is required.');

//   // Validate Photo
//   validateField('#photo', (val) => val === '', 'Photo is required.');

//   // Validate Expiry Date
//   validateField(
//     '#expiryDate',
//     (val) => new Date(val) < new Date(),
//     'Expiry date cannot be in the past.',
//   );

//   // Function to validate the entire form before submission
//   function validateForm() {
//     let hasError = false;
//     // Validate each field again before form submission
//     $('input, select').each(function () {
//       const condition = $(this).data('condition');
//       const message = $(this).data('message');
//       if (condition && message && condition($(this).val())) {
//         $(this).css('border-color', 'red');
//         $(this).next('.error-message').text(message).show();
//         hasError = true;
//       }
//     });

//     return !hasError;
//   }

//   // AJAX form submission for adding a product
//   $('#addProductForm').submit(function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Perform the final validation check
//     if (!validateForm()) {
//       $('.form-message')
//         .text('Please fix the errors in the form before submitting.')
//         .css('color', 'red')
//         .show();
//       return; // Stop the form submission
//     }

//     var formData = new FormData(this); // Create FormData object to send form data including files

//     // Fetch the token from local storage
//     var token = localStorage.getItem('token');

//     $.ajax({
//       url: '/api/v1/products',
//       type: 'POST',
//       data: formData,
//       headers: {
//         Authorization: 'Bearer ' + token, // Include the token in the request headers
//       },
//       contentType: false, // Important! Don't set contentType
//       processData: false, // Important! Don't process the data
//       success: function (response) {
//         console.log(response); // Log the response for debugging

//         if (response.status === 'success') {
//           // Show success message to user
//           $('.form-message')
//             .text('Product created successfully!')
//             .css('color', 'green')
//             .show();
//         } else {
//           // Show error message to user if needed
//           $('.form-message')
//             .text('Failed to create product. Please try again.')
//             .css('color', 'red')
//             .show();
//         }
//       },
//       error: function (xhr, status, error) {
//         console.error(xhr.responseText); // Log detailed error message
//         $('.form-message')
//           .text('Failed to create product. Please try again.')
//           .css('color', 'red')
//           .show();
//       },
//     });
//   });

//   // Redirect to dashboard on button click
//   $('#backToDashboardBtn').click(function (event) {
//     event.preventDefault(); // Prevent default link behavior if needed

//     // Redirect to the dashboard page
//     window.location.href = '/dashboard';
//   });

//   // Attach conditions and messages to fields for final validation check
//   $('#name')
//     .data('condition', (val) => val.trim() === '')
//     .data('message', 'Product name is required.');
//   $('#brand')
//     .data('condition', (val) => val.trim() === '')
//     .data('message', 'Brand is required.');
//   $('#price')
//     .data('condition', (val) => val <= 0)
//     .data('message', 'Price must be greater than zero.');
//   $('#category')
//     .data('condition', (val) => val === '')
//     .data('message', 'Category is required.');
//   $('#size')
//     .data('condition', (val) => val === '')
//     .data('message', 'Size is required.');
//   $('#photo')
//     .data('condition', (val) => val === '')
//     .data('message', 'Photo is required.');
//   $('#expiryDate')
//     .data('condition', (val) => new Date(val) < new Date())
//     .data('message', 'Expiry date cannot be in the past.');
// });
