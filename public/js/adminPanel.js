/**
 * Admin Dashboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Card routing configuration
  const cardRoutes = {
    'post-job-card': '/jobs/post-job',
    'jobs-card': '/jobs',
    'shortlisted-card': '/jobs/shortlisted',
    'applicants': '/applications'
  };

  // Add click handlers to all cards
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const route = cardRoutes[card.id];
      if (route) {
        window.location.href = route;
      } else {
        console.warn('No route defined for:', card.id);
      }
    });
  });


  // Floating action button handler
  const floatingAction = document.querySelector('.floating-action');
  if (floatingAction) {
    floatingAction.addEventListener('click', () => {
      // Default to the post job route
      window.location.href = cardRoutes['post-job-card'];
    });
  }

  // Handle notification clicks
  const notificationsIcon = document.querySelector('.notifications-icon');
  if (notificationsIcon) {
    notificationsIcon.addEventListener('click', () => {
      // You could show a dropdown or navigate to notifications page
      console.log('Notifications clicked');
      // Implement notification panel logic here
    });
  }


  // Logout button handler
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Handle logout logic
      console.log('Logout clicked');
      // You might want to send a request to a logout endpoint
      // or clear session storage before redirecting
      // window.location.href = '/logout';
    });
  }
});