// Google OAuth configuration
const googleClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const googleAPIKey = 'YOUR_GOOGLE_API_KEY';
const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

// Initialize Google Auth
function initGoogleAuth() {
  gapi.load('auth2', () => {
    gapi.auth2.init({
      client_id: googleClientId,
      scope: 'profile email'
    }).then(() => {
      document.getElementById('google-signin').addEventListener('click', handleGoogleSignIn);
    });
  });
}

// Handle Google Sign In
function handleGoogleSignIn() {
  const auth2 = gapi.auth2.getAuthInstance();
  
  auth2.signIn().then(googleUser => {
    const profile = googleUser.getBasicProfile();
    const email = profile.getEmail();
    const idToken = googleUser.getAuthResponse().id_token;
    
    // Verify the student exists in the system
    verifyStudent(email, idToken);
  }).catch(error => {
    console.error('Google sign-in error:', error);
    showError('Failed to sign in with Google. Please try again.');
  });
}

// Verify student exists in the marks sheet
function verifyStudent(email, idToken) {
  showLoading(true);
  
  // First check if we have cached data
  checkLocalData(email).then(hasLocalData => {
    if (hasLocalData) {
      // Use cached data if available
      return getStudentData(email, 'cache');
    } else {
      // Fetch fresh data from server
      return getStudentData(email, 'server', idToken);
    }
  }).then(studentData => {
    if (studentData.error) {
      throw new Error(studentData.error);
    }
    displayStudentData(studentData);
    showView('marks-view');
  }).catch(error => {
    console.error('Error verifying student:', error);
    showError(error.message || 'Failed to verify student. Please try again.');
  }).finally(() => {
    showLoading(false);
  });
}

// Logout handler
function setupLogout() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      showView('login-view');
    });
  });
}

// Initialize auth module
document.addEventListener('DOMContentLoaded', () => {
  initGoogleAuth();
  setupLogout();
  document.getElementById('retry-btn').addEventListener('click', () => {
    showView('login-view');
  });
  
  // Check network status
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});

// Network status
function updateOnlineStatus() {
  const statusElement = document.getElementById('offline-status');
  if (!navigator.onLine) {
    statusElement.textContent = 'You are currently offline. Displaying cached data.';
    statusElement.classList.add('offline');
  } else {
    statusElement.textContent = '';
    statusElement.classList.remove('offline');
  }
}
