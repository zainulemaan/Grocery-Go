$(document).ready(function() {
    // Function to get the JWT token from cookies
    function getJwtToken() {
        const name = 'jwt=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    }

    // Function to decode the JWT token and get user ID
    function getUserIdFromToken(token) {
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                return decodedToken.id; // Assuming 'id' is the field with user ID
            } catch (e) {
                console.error('Failed to decode JWT token:', e);
            }
        }
        return null;
    }

    // Fetch orders
    const jwtToken = getJwtToken();
    const userId = getUserIdFromToken(jwtToken);
    if (userId) {
        const apiUrl = `/api/v1/order/${userId}/getAllOrders`;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                if (response.status === 'success') {
                    const { completedOrders, canceledOrders } = response.data;

                    // Function to handle appending orders
                    function appendOrders(orders, container) {
                        orders.forEach((order, index) => {
                            console.log('Order:', order); // Debugging information
                            
                            const products = Array.isArray(order.items) 
                                ? order.items.map(item => `${item.productName} (x${item.productQuantity})`).join(', ')
                                : 'N/A';
                            const subtotal = order.subTotal != null ? `PKR ${order.subTotal.toFixed(2)}` : 'N/A';
                            const statusIcon = order.status === 'completed' ? 'fas fa-check-circle' : 'fas fa-times-circle';

                            $(container).append(`
                                <div class="order-item">
                                    <div class="order-header">
                                        <h3>Order #${index + 1}</h3>
                                        <span class="status">
                                            <i class="${statusIcon}"></i> ${order.status}
                                        </span>
                                    </div>
                                    <div class="order-details">
                                        <p><strong>Products:</strong> ${products}</p>
                                        <p><strong>Subtotal:</strong> ${subtotal}</p>
                                        <p><strong>Address:</strong> ${order.address}</p>
                                        <p><strong>Phone Number:</strong> ${order.phoneNumber}</p>
                                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                                    </div>
                                </div>
                            `);
                        });
                    }

                    // Append completed orders
                    const completedOrdersContainer = $('#completed-orders');
                    if (Array.isArray(completedOrders)) {
                        appendOrders(completedOrders, completedOrdersContainer);
                    } else {
                        console.error('Completed orders are not in the expected format:', completedOrders);
                    }

                    // Append canceled orders
                    const canceledOrdersContainer = $('#canceled-orders');
                    if (Array.isArray(canceledOrders)) {
                        appendOrders(canceledOrders, canceledOrdersContainer);
                    } else {
                        console.error('Canceled orders are not in the expected format:', canceledOrders);
                    }
                } else {
                    console.error('Response status not success:', response.status);
                }
            },
            error: function(error) {
                console.error('Error fetching orders:', error);
            }
        });
    } else {
        console.error('User ID not found.');
    }
});

