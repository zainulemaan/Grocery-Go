$(document).ready(function () {
    $('input[name="paymentMethod"]').on('change', function () {
      if ($(this).val() === 'cash') {
        $('.checkout-form-cash').show();
        $('.checkout-form').hide();
      } else if ($(this).val() === 'card') {
        $('.checkout-form').show();
        $('.checkout-form-cash').hide();
      }
    });
  
    // Trigger change event to initialize the correct form on page load
    $('input[name="paymentMethod"]:checked').trigger('change');
  });
  