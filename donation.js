// SevaSetu — Donation page logic

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const ngoId = urlParams.get('ngo_id') || '';
const ngoName = urlParams.get('ngo_name') || '';
const city = urlParams.get('city') || '';
const lat = urlParams.get('lat') || '';
const lng = urlParams.get('lng') || '';

// UI elements
const ngoNameEl = document.getElementById('ngoName');
const ngoIdEl = document.getElementById('ngoId');
const ngoCityEl = document.getElementById('ngoCity');
const categorySelect = document.getElementById('itemCategory');
const conditionSelect = document.getElementById('condition');
const donationForm = document.getElementById('donationForm');
const addItemBtn = document.getElementById('addItemBtn');
const itemsListCard = document.getElementById('itemsListCard');
const itemsList = document.getElementById('itemsList');
const itemsCount = document.getElementById('itemsCount');
const continueBtn = document.getElementById('continueBtn');

// State
let itemsCatalog = null;
let addedItems = [];

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
  }, 3000);
}

// Add item to list
function addItemToList(item) {
  addedItems.push(item);
  updateItemsList();
  updateItemsCount();
  showSuccess(`✅ Added: ${item.item_name} (${item.quantity} ${item.item_category})`);
}

// Remove item from list
function removeItemFromList(index) {
  const removedItem = addedItems[index];
  addedItems.splice(index, 1);
  updateItemsList();
  updateItemsCount();
  showSuccess(`Removed: ${removedItem.item_name}`);
}

// Update items list display
function updateItemsList() {
  itemsList.innerHTML = '';
  
  if (addedItems.length === 0) {
    itemsListCard.style.display = 'none';
    continueBtn.style.display = 'none';
    return;
  }
  
  itemsListCard.style.display = 'block';
  continueBtn.style.display = 'block';
  
  addedItems.forEach((item, index) => {
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    
    itemRow.innerHTML = `
      <div class="item-info">
        <div class="item-name">${escapeHtml(item.item_name)}</div>
        <div class="item-details">
          <div class="item-detail">
            <span class="label">Category:</span>
            <span class="value">${escapeHtml(item.item_category)}</span>
          </div>
          <div class="item-detail">
            <span class="label">Quantity:</span>
            <span class="value">${item.quantity}</span>
          </div>
          <div class="item-detail">
            <span class="label">Condition:</span>
            <span class="value">${escapeHtml(item.condition)}</span>
          </div>
        </div>
      </div>
      <button type="button" class="remove-btn" data-index="${index}">Remove</button>
    `;
    
    // Add remove button event listener
    const removeBtn = itemRow.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => removeItemFromList(index));
    
    itemsList.appendChild(itemRow);
  });
}

// Update items count
function updateItemsCount() {
  itemsCount.textContent = addedItems.length;
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Handle form submission (Add Item)
donationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Disable submit button
  addItemBtn.disabled = true;
  addItemBtn.textContent = 'Adding...';
  
  // Get form data
  const itemData = {
    item_category: categorySelect.value,
    item_name: document.getElementById('itemName').value.trim(),
    quantity: parseInt(document.getElementById('quantity').value),
    condition: conditionSelect.value
  };
  
  // Validate
  if (!itemData.item_category || !itemData.item_name || !itemData.quantity || !itemData.condition) {
    showError('Please fill in all required fields.');
    addItemBtn.disabled = false;
    addItemBtn.textContent = 'Add Item +';
    return;
  }
  
  if (itemData.quantity < 1) {
    showError('Quantity must be at least 1.');
    addItemBtn.disabled = false;
    addItemBtn.textContent = 'Add Item +';
    return;
  }
  
  // Add item to list
  addItemToList(itemData);
  
  // Reset form
  donationForm.reset();
  addItemBtn.disabled = false;
  addItemBtn.textContent = 'Add Item +';
  
  // Scroll to items list
  itemsListCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Handle continue to scheduling
continueBtn.addEventListener('click', () => {
  if (addedItems.length === 0) {
    showError('Please add at least one item before continuing.');
    return;
  }
  
  // Prepare data to pass to scheduling page
  const params = new URLSearchParams({
    ngo_id: ngoId,
    ngo_name: ngoName,
    city: city,
    lat: lat,
    lng: lng,
    items: JSON.stringify(addedItems)
  });
  
  window.location.href = `pickup.html?${params.toString()}`;
});

// Initialize on page load
init();
