$(document).ready(function () {
  let pendingCounter = 1;
  let solvedCounter = 1;

  // Function to fetch and display complaints
  function fetchComplaints() {
    $.ajax({
      url: '/api/v1/contactUs/getAllContactUs',
      method: 'GET',
      success: function (response) {
        if (response.contactUsEntries.length > 0) {
          let pendingHtml = '';
          let solvedHtml = '';

          response.contactUsEntries.forEach((complaint) => {
            const date = new Date(complaint.createdAt);
            const formattedDate = date.toLocaleDateString(); // Date part
            const formattedTime = date.toLocaleTimeString(); // Time part

            const complaintHtml = `
                <li class="complaint-item">
                  <div class="complaint-details">
                    <div class="icon">
                      <i class="fas fa-${complaint.status === 'pending' ? 'exclamation-triangle' : 'check-circle'}"></i>
                    </div>
                    <div class="info">
                      <h3>#${complaint.status === 'pending' ? pendingCounter++ : solvedCounter++}</h3>
                      <h3>${complaint.name}</h3>
                      <p>Query Type: ${complaint.queryType}</p>
                      <p>Email: ${complaint.email}</p>
                      <p>Phone Number: ${complaint.phoneNumber}</p>
                      <p>Details: ${complaint.details}</p>
                      <p>Time: ${formattedDate} ${formattedTime}</p>
                      <p>Status: <span class="badge ${complaint.status}">${complaint.status}</span></p>
                    </div>
                    ${
                      complaint.status === 'pending'
                        ? `
                        <div class="actions">
                          <button class="proceed-btn" data-id="${complaint._id}">Solved</button>
                        </div>
                        `
                        : ''
                    }
                  </div>
                </li>
              `;

            if (complaint.status === 'pending') {
              pendingHtml += complaintHtml;
            } else {
              solvedHtml += complaintHtml;
            }
          });

          $('#pending-complaints').html(pendingHtml);
          $('#solved-complaints').html(solvedHtml);
        } else {
          $('#pending-complaints').html('<li>No pending complaints.</li>');
          $('#solved-complaints').html('<li>No solved complaints.</li>');
        }
      },
      error: function () {
        alert('Error fetching complaints.');
      },
    });
  }

  // Fetch complaints on page load
  fetchComplaints();

  // Handle delete button click
  $(document).on('click', '.delete-btn', function () {
    const complaintId = $(this).data('id');
    $.ajax({
      url: `/api/v1/contactUs/${complaintId}/delete`,
      method: 'DELETE',
      success: function (response) {
        alert('Complaint deleted successfully.');
        fetchComplaints(); // Refresh the list after deletion
      },
      error: function () {
        alert('Error deleting complaint.');
      },
    });
  });

  // Handle proceed button click
  $(document).on('click', '.proceed-btn', function () {
    const complaintId = $(this).data('id');
    $.ajax({
      url: `/api/v1/contactUs/${complaintId}/solved`, // Update the URL to match your controller
      method: 'PATCH',
      success: function (response) {
        alert('Complaint status updated to solved.');
        fetchComplaints(); // Refresh the list after updating status
      },
      error: function () {
        alert('Error updating complaint status.');
      },
    });
  });
});

//  $(document).ready(function () {
//   let complaintCounter = 1;

//   // Function to fetch and display complaints
//   function fetchComplaints() {
//     $.ajax({
//       url: '/api/v1/contactUs/getAllContactUs',
//       method: 'GET',
//       success: function (response) {
//         if (response.contactUsEntries.length > 0) {
//           let pendingHtml = '';
//           let solvedHtml = '';

//           response.contactUsEntries.forEach((complaint) => {
//             const date = new Date(complaint.createdAt);
//             const formattedDate = date.toLocaleDateString(); // Date part
//             const formattedTime = date.toLocaleTimeString(); // Time part

//             const complaintHtml = `
//                 <li class="complaint-item">
//                   <div class="complaint-details">
//                     <div class="icon">
//                       <i class="fas fa-${complaint.status === 'pending' ? 'exclamation-triangle' : 'check-circle'}"></i>
//                     </div>
//                     <div class="info">
//                       <h3>#${complaintCounter++}</h3>
//                       <h3>${complaint.name}</h3>
//                       <p>Query Type: ${complaint.queryType}</p>
//                       <p>Email: ${complaint.email}</p>
//                       <p>Phone Number: ${complaint.phoneNumber}</p>
//                       <p>Details: ${complaint.details}</p>
//                       <p>Time: ${formattedDate} ${formattedTime}</p>
//                       <p>Status: <span class="badge ${complaint.status}">${complaint.status}</span></p>
//                     </div>
//                     ${
//                       complaint.status === 'pending'
//                         ? `
//                         <div class="actions">
//                           <button class="proceed-btn" data-id="${complaint._id}">Solved</button>
//                         </div>
//                         `
//                         : ''
//                     }
//                   </div>
//                 </li>
//               `;

//             if (complaint.status === 'pending') {
//               pendingHtml += complaintHtml;
//             } else {
//               solvedHtml += complaintHtml;
//             }
//           });

//           $('#pending-complaints').html(pendingHtml);
//           $('#solved-complaints').html(solvedHtml);
//         } else {
//           $('#pending-complaints').html('<li>No pending complaints.</li>');
//           $('#solved-complaints').html('<li>No solved complaints.</li>');
//         }
//       },
//       error: function () {
//         alert('Error fetching complaints.');
//       },
//     });
//   }

//   // Fetch complaints on page load
//   fetchComplaints();

//   // Handle delete button click
//   $(document).on('click', '.delete-btn', function () {
//     const complaintId = $(this).data('id');
//     $.ajax({
//       url: `/api/v1/contactUs/${complaintId}/delete`,
//       method: 'DELETE',
//       success: function (response) {
//         alert('Complaint deleted successfully.');
//         fetchComplaints(); // Refresh the list after deletion
//       },
//       error: function () {
//         alert('Error deleting complaint.');
//       },
//     });
//   });

//   // Handle proceed button click
//   $(document).on('click', '.proceed-btn', function () {
//     const complaintId = $(this).data('id');
//     $.ajax({
//       url: `/api/v1/contactUs/${complaintId}/solved`, // Update the URL to match your controller
//       method: 'PATCH',
//       success: function (response) {
//         alert('Complaint status updated to solved.');
//         fetchComplaints(); // Refresh the list after updating status
//       },
//       error: function () {
//         alert('Error updating complaint status.');
//       },
//     });
//   });
// });

// $(document).ready(function () {
//   let complaintCounter = 1;
//   // Function to fetch and display complaints
//   function fetchComplaints() {
//     $.ajax({
//       url: '/api/v1/contactUs/getAllContactUs',
//       method: 'GET',
//       success: function (response) {
//         if (response.contactUsEntries.length > 0) {
//           let pendingHtml = '';
//           let solvedHtml = '';

//           response.contactUsEntries.forEach((complaint) => {
//             const date = new Date(complaint.createdAt);
//             const formattedDate = date.toLocaleDateString(); // Date part
//             const formattedTime = date.toLocaleTimeString();
//             // const formattedDate = new Date(
//             //   complaint.createdAt,
//             // ).toLocaleDateString();

//             const complaintHtml = `
//                             <li class="complaint-item">
//                                 <div class="complaint-details">
//                                     <div class="icon">
//                                         <i class="fas fa-${complaint.status === 'pending' ? 'exclamation-triangle' : 'check-circle'}"></i>
//                                     </div>
//                                     <div class="info">
//                                         <h3>#${complaintCounter++}</h3>
//                                         <h3>${complaint.name}</h3>
//                                         <p>Query Type: ${complaint.queryType}</p>
//                                         <p>Email: ${complaint.email}</p>
//                                         <p>Phone Number: ${complaint.phoneNumber}</p>
//                                         <p>Details: ${complaint.details}</p>
//                                         <p>Time: ${formattedDate} ${formattedTime}</p>
//                                         <p>Status: <span class="badge ${complaint.status}">${complaint.status}</span></p>
//                                     </div>
//                                     ${
//                                       complaint.status === 'pending'
//                                         ? `
//                                         <div class="actions">

//                                             <button class="proceed-btn" data-id="${complaint._id}">Solved</button>
//                                         </div>
//                                     `
//                                         : ''
//                                     }
//                                 </div>
//                             </li>
//                         `;

//             if (complaint.status === 'pending') {
//               pendingHtml += complaintHtml;
//             } else {
//               solvedHtml += complaintHtml;
//             }
//           });

//           $('#pending-complaints').html(pendingHtml);
//           $('#solved-complaints').html(solvedHtml);
//         } else {
//           $('#pending-complaints').html('<li>No pending complaints.</li>');
//           $('#solved-complaints').html('<li>No solved complaints.</li>');
//         }
//       },
//       error: function () {
//         alert('Error fetching complaints.');
//       },
//     });
//   }

//   // Fetch complaints on page load
//   fetchComplaints();

//   // Handle delete button click
//   $(document).on('click', '.delete-btn', function () {
//     const complaintId = $(this).data('id');
//     $.ajax({
//       url: `/api/v1/contactUs/${complaintId}/delete`,
//       method: 'DELETE',
//       success: function (response) {
//         alert('Complaint deleted successfully.');
//         fetchComplaints(); // Refresh the list after deletion
//       },
//       error: function () {
//         alert('Error deleting complaint.');
//       },
//     });
//   });

//   // Handle proceed button click
//   $(document).on('click', '.proceed-btn', function () {
//     const complaintId = $(this).data('id');
//     $.ajax({
//       url: `/api/v1/contactUs/${complaintId}/proceed`,
//       method: 'PATCH',
//       success: function (response) {
//         alert('Complaint status updated to solved.');
//         fetchComplaints(); // Refresh the list after updating status
//       },
//       error: function () {
//         alert('Error updating complaint status.');
//       },
//     });
//   });
// });
