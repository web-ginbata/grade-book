// UI Helpers
function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}

function showError(message) {
  document.getElementById('error-text').textContent = message;
  showView('error-view');
}

function showLoading(show) {
  const appContent = document.getElementById('app-content');
  if (show) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    appContent.appendChild(loader);
  } else {
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.remove();
    }
  }
}

// Get student data from server or cache
function getStudentData(email, source = 'server', idToken = null) {
  if (source === 'cache') {
    return getStudentDataFromCache(email);
  }
  
  return fetchStudentDataFromServer(email, idToken).then(data => {
    if (!data.error) {
      // Cache the data for offline use
      return storeStudentData(data).then(() => data);
    }
    return data;
  });
}

// Fetch student data from Google Sheets via Apps Script
function fetchStudentDataFromServer(email, idToken) {
  return new Promise((resolve, reject) => {
    const url = `${scriptURL}?action=getStudentData&email=${encodeURIComponent(email)}&authMode=valid`;
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}`
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data);
      }
    }).catch(error => {
      console.error('Error fetching student data:', error);
      reject(new Error('Failed to fetch data. You might be offline.'));
    });
  });
}

// Display student data in the UI
function displayStudentData(studentData) {
  document.getElementById('student-name').textContent = studentData.Name || 'Student';
  document.getElementById('student-email').textContent = studentData.Email;
  
  const marksTable = document.getElementById('marks-data');
  marksTable.innerHTML = '';
  
  // Skip the first two columns (Email and Name)
  const keys = Object.keys(studentData);
  for (let i = 2; i < keys.length; i++) {
    const key = keys[i];
    if (studentData[key] !== undefined && studentData[key] !== '') {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.textContent = key;
      row.appendChild(nameCell);
      
      const valueCell = document.createElement('td');
      valueCell.textContent = studentData[key];
      row.appendChild(valueCell);
      
      marksTable.appendChild(row);
    }
  }
}
