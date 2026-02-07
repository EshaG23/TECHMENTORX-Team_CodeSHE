// SevaSetu — Donation page logic

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const ngoId = urlParams.get('ngo_id') || '';
const ngoName = urlParams.get('ngo_name') || '';
const city = urlParams.get('city') || '';

// UI elements
const ngoNameEl = document.getElementById('ngoName');
const ngoIdEl = document.getElementById('ngoId');
const ngoCityEl = document.getElementById('ngoCity');
const categorySelect = document.getElementById('itemCategory');
const conditionSelect = document.getElementById('condition');
const donationForm = document.getElementById('donationForm');
const submitBtn = document.getElementById('submitBtn');

// State
let itemsCatalog = null;

// Initialize page
async function init() {
  // Display NGO info
  ngoNameEl.textContent = ngoName || '—';
  ngoIdEl.textContent = `ID: ${ngoId || '—'}`;
  ngoCityEl.textContent = city ? `📍 ${city}` : '—';

  // Load items catalog
  try {
    const response = await fetch('/api/items_catalog');
    if (!response.ok) throw new Error('Failed to load items catalog');
    itemsCatalog = await response.json();
    populateCategories();
    populateConditions();
  } catch (error) {
    console.error('Error loading items catalog:', error);
    showError('Failed to load donation options. Please refresh the page.');
  }
}

// Populate category dropdown
function populateCategories() {
  if (!itemsCatalog || !itemsCatalog.categories) return;
  
  categorySelect.innerHTML = '<option value="">Select a category</option>';
  itemsCatalog.categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Populate condition dropdown
function populateConditions() {
  if (!itemsCatalog || !itemsCatalog.condition_levels) return;
  
  conditionSelect.innerHTML = '<option value="">Select condition</option>';
  itemsCatalog.condition_levels.forEach(condition => {
    const option = document.createElement('option');
    option.value = condition;
    option.textContent = condition;
    conditionSelect.appendChild(option);
  });
}

// Show error message
function showError(message) {
  // Remove existing messages
  const existingError = document.querySelector('.error-message');
  const existingSuccess = document.querySelector('.success-message');
  
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message show';
  errorDiv.textContent = message;
  donationForm.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Show success message
function showSuccess(message) {
  // Remove existing messages
  const existingError = document.querySelector('.error-message');
  const existingSuccess = document.querySelector('.success-message');
  
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();
  
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message show';
  successDiv.textContent = message;
  donationForm.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Handle form submission
donationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  // Get form data
  const formData = {
    ngo_id: ngoId,
    ngo_name: ngoName,
    city: city,
    item_category: categorySelect.value,
    item_name: document.getElementById('itemName').value.trim(),
    quantity: parseInt(document.getElementById('quantity').value),
    condition: conditionSelect.value
  };
  
  // Validate
  if (!formData.item_category || !formData.item_name || !formData.quantity || !formData.condition) {
    showError('Please fill in all required fields.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Donation →';
    return;
  }
  
  if (formData.quantity < 1) {
    showError('Quantity must be at least 1.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Donation →';
    return;
  }
  
  // Submit donation (you can extend this to actually save to backend)
  try {
    // For now, just show success message
    // In a real app, you would POST to an API endpoint
    console.log('Donation data:', formData);
    
    showSuccess(`✅ Donation submitted successfully! Category: ${formData.item_category}, Item: ${formData.item_name}, Quantity: ${formData.quantity}, Condition: ${formData.condition}`);
    
    // Reset form after a delay
    setTimeout(() => {
      donationForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Donation →';
    }, 2000);
    
  } catch (error) {
    console.error('Error submitting donation:', error);
    showError('Failed to submit donation. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Donation →';
  }
});

// Initialize on page load
init();

