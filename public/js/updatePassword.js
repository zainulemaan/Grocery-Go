$(document).ready(function () {
  $('#update-password-form').on('submit', async function (event) {
    event.preventDefault(); // Prevent form from submitting normally

    // Form values
    const passwordCurrent = $('#passwordCurrent').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    const alertMessage = $('#alert-message');

    // Validation
    if (password.length < 8) {
      alertMessage.text('New password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      alertMessage.text('Passwords do not match.');
      return;
    }

    try {
      // Perform the AJAX request
      const response = await $.ajax({
        url: '/api/v1/users/UpdateMyPassword',
        method: 'PATCH',
        data: {
          passwordCurrent,
          password,
          confirmPassword,
        },
        dataType: 'json',
      });

      // On success
      alertMessage.text('Password updated successfully!');
      // Redirect or do something else after success
      // window.location.href = '/somePage';
    } catch (error) {
      // Handle error
      alertMessage.text(
        error.responseJSON.message || 'An error occurred. Please try again.',
      );
    }
  });
});
