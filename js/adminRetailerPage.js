const jwtAdminToken = window.localStorage.getItem('jwtAdminToken');
const jwtRetailerToken = window.localStorage.getItem('jwtRetailerToken');

const adminSection = document.getElementById("adminSection");
const retailerSection = document.getElementById("retailerSection");
const adminSectionButton = document.getElementById('admin-button');
const retailerSectionButton = document.getElementById('retailer-button');

const addProductToSupplierForm = document.getElementById('addProductForm');
const addProductToSupplierFormButton = document.getElementById("add-product-to-supplier-button");

const chooseProductFromSupplierToPurchaseForm = document.getElementById("buyProductFromSupplierForm");
const chooseProductFromSupplierToPurchaseButton = document.getElementById("choose-product-from-supplier-to-purchase-button");

const storePurchasesInInventoryButton = document.getElementById("store-purchases-in-inventory-button");
const storePurchasesInInventoryForm = document.getElementById("storePurchasesInInventoryForm");

const addLocationForm = document.getElementById("addLocationForm");
const addLocationFormButton = document.getElementById("add-location-button");

const addCustomerForm = document.getElementById("addCustomerForm");
const addCustomerBtn = document.getElementById("add-customer-button");

const addSupplierForm = document.getElementById("addSupplierForm");
const addSupplierBtn = document.getElementById("add-supplier-button");

const sellInventoryItemToCustomerForm = document.getElementById("sellInventoryItemToCustomerForm");
const sellInventoryItemToCustomerButton = document.getElementById("sell-inventory-item-to-customer-button");


console.log(jwtAdminToken);
console.log(jwtRetailerToken);

adminSection.classList.remove("hidden");

adminSectionButton.addEventListener('click', (event) => {
  event.preventDefault();

  adminSection.classList.remove('hidden');
  retailerSection.classList.add('hidden');

});


retailerSectionButton.addEventListener('click', (event) => {
  event.preventDefault();

  adminSection.classList.add('hidden');
  retailerSection.classList.remove('hidden');
});

addProductToSupplierFormButton.addEventListener('click', (event) => {
  event.preventDefault();
  addProductToSupplierForm.classList.toggle("hidden");
})

chooseProductFromSupplierToPurchaseButton.addEventListener('click', (event) => {
  event.preventDefault();
  chooseProductFromSupplierToPurchaseForm.classList.toggle("hidden");
})

storePurchasesInInventoryButton.addEventListener('click', (event) => {
  event.preventDefault();
  storePurchasesInInventoryForm.classList.toggle("hidden");
})

addLocationFormButton.addEventListener('click', (event) => {
  event.preventDefault();

  addLocationForm.classList.toggle('hidden');
})

addCustomerBtn.addEventListener('click', (event) => {
  event.preventDefault();
  addCustomerForm.classList.toggle('hidden');
})

addSupplierBtn.addEventListener('click', (event) => {
  event.preventDefault();
  addSupplierForm.classList.toggle('hidden');
})

sellInventoryItemToCustomerButton.addEventListener('click', (event) => {
  event.preventDefault();
  sellInventoryItemToCustomerForm.classList.toggle('hidden');
})


////////// ADMIN: Add product to supplier



document.addEventListener("DOMContentLoaded", async function () {
  await populateSupplierDropdown();

  document.getElementById("addProductForm").addEventListener("submit", addProduct);
});



async function populateSupplierDropdown() {
  const supplierSelect = document.getElementById("supplierSelect");
  const suppliers = await fetchSuppliers();

  suppliers.forEach((supplier) => {
    const option = document.createElement("option");
    option.value = supplier.id;
    option.textContent = supplier.supplierName;
    supplierSelect.appendChild(option);
  });
}

async function addProduct(event) {
  event.preventDefault();

  const supplierId = document.getElementById("supplierSelect").value;
  const productName = document.getElementById("productName").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const price = parseFloat(document.getElementById("price").value);

  const newProduct = {
    supplierId: supplierId,
    productName: productName,
    description: description,
    category: category,
    price: price
    // Add more properties if necessary
  };

  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Product", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtAdminToken}`,
    },
    body: JSON.stringify(newProduct),
  });

  const addedProduct = await response.json();
  console.log('Product added:', addedProduct);

  document.getElementById("addProductForm").reset();
}







///////////////// Retailer: sell to customer







document.addEventListener("DOMContentLoaded", async function () {
  await populateCustomersToSellDropDown();
  await populateLocationsForInventoryItemsDropDown();
  document.getElementById("availableLocationsForInventoryItemSelect").addEventListener('change', populateInventoryItemsFromLocationsDropDown);
  document.getElementById("sellInventoryItemToCustomerForm").addEventListener('submit', sellToCustomer);
})

async function populateCustomersToSellDropDown() {
  const availableCustomersToSell = document.getElementById("availableCustomersToSell");
  const customers = await fetchCustomers();

  customers.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer.id;
    option.textContent = customer.customerName;
    availableCustomersToSell.appendChild(option);
  })
}
async function populateLocationsForInventoryItemsDropDown() {
  const availableLocationsForInventoryItemSelect = document.getElementById("availableLocationsForInventoryItemSelect");
  const locations = await fetchLocations();

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location.id;
    option.textContent = location.locationName;
    availableLocationsForInventoryItemSelect.appendChild(option);

  });

}

async function populateInventoryItemsFromLocationsDropDown() {
  const locationId = document.getElementById("availableLocationsForInventoryItemSelect").value;
  console.log("iside populate location id", locationId);
  const availableInventoryItemFromLocationSelect = document.getElementById("availableInventoryItemFromLocationSelect");

  availableInventoryItemFromLocationSelect.innerHTML = "<option value=''>Select an Inventory Item</option>";

  const inventoryItems = await fetchInventoryItems(parseInt(locationId));

  inventoryItems.forEach((inventoryItem) => {
    const option = document.createElement("option");
    option.value = inventoryItem.id;
    // console.log("inside populate invenotry Id", inventoryItem.id);
    option.textContent = inventoryItem.productName;
    availableInventoryItemFromLocationSelect.appendChild(option);
  });
}

async function sellToCustomer(event) {
  event.preventDefault();

  const customerId = document.getElementById("availableCustomersToSell").value;
  const locationId = document.getElementById("availableLocationsForInventoryItemSelect").value;
  const inventoryItemId = document.getElementById("availableInventoryItemFromLocationSelect").value;
  console.log("inventoryitemId is ", inventoryItemId)

  const quantityToSell = document.getElementById("sellQuantity").value;
  const price = 0;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }

  const doesSalesOrderExist = await fetch(`https://groupapiproject.azurewebsites.net/ByCustomerId/${customerId}`, {
    method: 'GET',
    headers: headers,
  });

  if (doesSalesOrderExist.ok) {
    const doesSalesOrderExistInfo = await doesSalesOrderExist.json();
    const salesOrderId = doesSalesOrderExistInfo.id;
    


    const salesOrderDetailObj = {
      salesOrderId: parseInt(salesOrderId),
      inventoryItemId: parseInt(inventoryItemId),
      quantity: parseInt(quantityToSell),
      price: parseInt(price)

    }

    console.log("salesOrderid is ", salesOrderId);
    console.log("inventoryitemId is ", inventoryItemId);
    console.log("quantity is ", quantityToSell);
    console.log("quantity is ", price);


    const creatingNewSalesOrderDetailObj = await fetch("https://groupapiproject.azurewebsites.net/api/SalesOrderItem", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtRetailerToken}`,
      },
      body: JSON.stringify(salesOrderDetailObj),
    });

    const apiResult = await creatingNewSalesOrderDetailObj.json();
    console.log('SalesOrderItem added:', apiResult);
    document.getElementById("sellInventoryItemToCustomerForm").reset();

  } else {

    const salesOrderObjCreate = {
      cusomterId: customerId,
      locationId: locationId,
      orderDate: (new Date()).toISOString()
    }

    const creatingSalesOrder = await fetch("https://groupapiproject.azurewebsites.net/api/SalesOrder", {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(salesOrderObjCreate)
    });

    const justCreatedSalesOrder = await fetch(`https://groupapiproject.azurewebsites.net/ByCustomerId/${customerId}`, {
      method: 'GET',
      headers: headers,
    });

    const justCreatedSalesOrderInfo = await justCreatedSalesOrder.json();
    const justCreatedSalesOrderId = justCreatedSalesOrderInfo.id;

    const salesOrderDetailObj = {
      salesOrderId: parseInt(justCreatedSalesOrderId),
      inventoryItemId: parseInt(inventoryItemId),
      quantity: parseInt(quantityToSell),
      price: price
    }

    const sendingSalesOrderItem = await fetch("https://groupapiproject.azurewebsites.net/api/SalesOrderItem", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtRetailerToken}`,
      },
      body: JSON.stringify(salesOrderDetailObj),
    });

    const sendingSalesOrderItemResult = await sendingSalesOrderItem.json();
    console.log("salesorderitem added", sendingSalesOrderItemResult);
    document.getElementById("sellInventoryItemToCustomerForm").reset();


  }



}




/////////////// Retailer : Store purchase in inventory








document.getElementById("refreshPurchasesBtn").addEventListener("click", populatePurchaseForPurchaseStoringDropDown);
document.getElementById("refreshLocationsBtn").addEventListener("click", populateLocationForPurchaseStoringDropDown);

document.addEventListener("DOMContentLoaded", async function () {




  await populateLocationForPurchaseStoringDropDown();
  await populatePurchaseForPurchaseStoringDropDown();
  document.getElementById("storePurchasesInInventoryForm").addEventListener("submit", storePurchaseInInventory);
})

async function populateLocationForPurchaseStoringDropDown() {

  const availableLocationsToStoreSelect = document.getElementById("availableLocationsToStoreSelect");
  const locations = await fetchLocations();

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location.id;
    option.textContent = location.locationName;
    availableLocationsToStoreSelect.appendChild(option);
  });

}

async function populatePurchaseForPurchaseStoringDropDown() {
  const availablePurchasesToStoreSelect = document.getElementById("availablePurchasesToStoreSelect");
  availablePurchasesToStoreSelect.innerHTML = "<option value=''>Select a purchase</option>";

  const purchases = await fetchPurchases();

  purchases.forEach((purchase) => {
    const option = document.createElement("option");
    option.value = purchase.id;
    option.textContent = purchase.productName + " || Quantity: " + purchase.quantity;
    option.dataset.purchaseOrderId = purchase.purchaseOrderId;
    availablePurchasesToStoreSelect.appendChild(option);
  })

}

async function fetchPurchases() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }
  const response = await fetch('https://groupapiproject.azurewebsites.net/api/PurchaseOrderItem', {
    method: 'GET',
    headers: headers
  });

  const data = await response.json();
  return data;
}



async function storePurchaseInInventory(event) {
  event.preventDefault();
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }


  const locationId = document.getElementById("availableLocationsToStoreSelect").value;
  const purchaseOrderItemId = document.getElementById("availablePurchasesToStoreSelect").value;


  const purchaseOrderItemObj = document.getElementById("availablePurchasesToStoreSelect");
  const selectedOption = purchaseOrderItemObj.options[purchaseOrderItemObj.selectedIndex]
  const idForApiCallForPurchaseOrder = selectedOption.dataset.purchaseOrderId;

  const obtainingPurchaseOrderId = await fetch(`https://groupapiproject.azurewebsites.net/PurchaseOrderItemId/${idForApiCallForPurchaseOrder}`, {
    method: 'GET',
    headers: headers
  });

  const obtainingPurchaseOrderIdInfo = await obtainingPurchaseOrderId.json();

  const purchaseOrderId = obtainingPurchaseOrderIdInfo.id;


  const newInventoryItemObject = {
    purchaseOrderId: parseInt(purchaseOrderId),
    purchaseOrderItemId: parseInt(purchaseOrderItemId),
    locationId: parseInt(locationId)
  };

  const creatingNewInventoryItemObj = await fetch("https://groupapiproject.azurewebsites.net/api/InventoryItem", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtRetailerToken}`,
    },
    body: JSON.stringify(newInventoryItemObject),
  });

  const apiResult = await creatingNewInventoryItemObj.json();
  console.log('InvItem added:', apiResult);
  document.getElementById("storePurchasesInInventoryForm").reset();
}








//////////// RETAILER: Display Locations




document.getElementById("displayLocationsBtn").addEventListener("click", displayLocations);

// Asynchronous function to display the list of suppliers and their products
async function displayLocations() {
  // Get the suppliersContainer element from the HTML
  const locationsContainer = document.getElementById("locationsContainer");
  // Clear any existing content in the suppliersContainer
  locationsContainer.innerHTML = "";

  // Call fetchSuppliers function to get the supplier data
  const locations = await fetchLocations();
  // Loop through each supplier object in the suppliers array
  locations.forEach(location => {
    // Create a new div element to display the supplier information
    const locationDiv = document.createElement("div");
    locationDiv.className = "location"; // need to add a custom class in css

    // Create a new span element to display the supplier name
    const locationName = document.createElement("span");
    locationName.textContent = location.locationName + " || Remaining Capacity: " + location.capacity;
    // Append the supplierName element to the supplierDiv
    locationDiv.appendChild(locationName);

    // Create a new button element to display the "View Products" button
    const viewProductsInInventoryItemsButton = document.createElement("button");
    viewProductsInInventoryItemsButton.textContent = "View Products in Inventory";
    // Add an onclick event to fetch and display products for the current supplier when clicked
    viewProductsInInventoryItemsButton.onclick = async function () {
      // Call fetchProducts function to get the product data for the current supplier
      const inventoryItems = await fetchInventoryItems(location.id);
      // Call displayProducts function to display the products list
      displayInventoryItems(inventoryItems, locationDiv);
    };
    // Append the viewProductsButton element to the supplierDiv
    locationDiv.appendChild(viewProductsInInventoryItemsButton);

    // Append the supplierDiv element to the suppliersContainer
    locationsContainer.appendChild(locationDiv);
  });
}


async function fetchLocations() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }
  // Fetch the data from the API endpoint
  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Location", {
    method: 'GET',
    headers: headers
  });
  // Convert the fetched data to a JSON object
  const locations = await response.json();
  // Return the JSON object containing the supplier data
  return locations;
}

async function fetchInventoryItems(locationId) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }
  // Fetch the data from the API endpoint, including the supplierId in the URL
  const response = await fetch(`https://groupapiproject.azurewebsites.net/api/InventoryItem/${locationId}`, {
    method: 'GET',
    headers: headers
  });
  // Convert the fetched data to a JSON object
  const inventoryItems = await response.json();
  // Return the JSON object containing the product data
  return inventoryItems;
}



// Function to display the list of products for a specific supplier
function displayInventoryItems(inventoryItems, locationDiv) {
  // Create a new unordered list element to display the products
  const inventoryItemList = document.createElement("ul");
  // Loop through each product object in the products array
  inventoryItems.forEach(inventoryItem => {
    // Create a new list item element to display the product name
    const inventoryItemItem = document.createElement("li");
    inventoryItemItem.textContent = "Product Name: " + inventoryItem.productName + " | " + "In Stock: " + inventoryItem.stock;
    // Append the productItem element to the productList
    inventoryItemList.appendChild(inventoryItemItem);
  });

  // Check if there's an existing product list in the supplierDiv
  const existingInventoryItemList = locationDiv.querySelector("ul");
  // If there's an existing product list, replace it with the new productList
  if (existingInventoryItemList) {
    locationDiv.replaceChild(inventoryItemList, existingInventoryItemList);
  }
  else {
    // If there's no existing product list, append the new productList to the supplierDiv
    locationDiv.appendChild(inventoryItemList);
  }
}













//////////////// RETAILER: Add a location









document.getElementById("addLocationForm").addEventListener('submit', addLocationToRetailer);

async function addLocationToRetailer(event) {

  event.preventDefault();
  const locationName = document.getElementById("locationName").value;
  const locationCapacity = document.getElementById("locationCapacity").value;
  const addingLocationObj = {
    locationName: locationName,
    capacity: parseInt(locationCapacity)
  };
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }

  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Location", {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(addingLocationObj)
  });

  const data = response.json();
  console.log("Loc added", data)


}








/////////////// RETAILER: create purchase order 






document.addEventListener("DOMContentLoaded", async function () {
  await populateSupplierForProductDropdown();
  document.getElementById("supplierForProductSelect").addEventListener("change", populateProductFromSupplierDropdown);
  document.getElementById("buyProductFromSupplierForm").addEventListener("submit", buyProductFromSupplier)

});

async function populateSupplierForProductDropdown() {
  const supplierForProductSelect = document.getElementById("supplierForProductSelect");
  const suppliers = await fetchSuppliers();

  suppliers.forEach((supplier) => {
    const option = document.createElement("option");
    option.value = supplier.id;
    option.textContent = supplier.supplierName;
    supplierForProductSelect.appendChild(option);
  });
}

async function populateProductFromSupplierDropdown() {
  const supplierId = document.getElementById("supplierForProductSelect").value; // since the option/supplier's Id is set in the populateSupplierForProductDropdown .value, we simply grab the value
  const productSelect = document.getElementById("productFromSupplierSelect");

  // Remove previous options from the product dropdown
  productSelect.innerHTML = "<option value=''>Select a product</option>";

  if (supplierId === "") {
    return;
  }

  const products = await fetchProductsBySupplier(supplierId);

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.productName;
    productSelect.appendChild(option);
  });
}

async function fetchProductsBySupplier(supplierId) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtAdminToken) {
    headers.append("Authorization", `Bearer ${jwtAdminToken}`);
  }
  const response = await fetch(`https://groupapiproject.azurewebsites.net/api/Product/${supplierId}`, {
    method: 'GET',
    headers: headers
  });
  const data = await response.json();
  return data
}

async function buyProductFromSupplier(event) {
  event.preventDefault();

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtRetailerToken) {
    headers.append("Authorization", `Bearer ${jwtRetailerToken}`);
  }

  const supplierId = document.getElementById("supplierForProductSelect").value;
  const productId = document.getElementById("productFromSupplierSelect").value;

  const purchaseOrderItemQuantity = parseInt(document.getElementById("purchaseOrderItemQuantity").value);
  const purchaseOrderItemPrice = 0;


  // Perform a POST API call with the selected supplier and product
  const doesPurchaseOrderExist = await fetch(`https://groupapiproject.azurewebsites.net/BySupplier/${supplierId}`, {
    method: 'GET',
    headers: headers
  });

  if (doesPurchaseOrderExist.ok) {
    console.log("we are here")
    const doesPurchaseOrderExistInfo = await doesPurchaseOrderExist.json();
    const purchaseOrderId = doesPurchaseOrderExistInfo.id


    const purchaseOrderItemDetail = {
      purchaseOrderId: parseInt(purchaseOrderId),
      productId: parseInt(productId),
      quantity: purchaseOrderItemQuantity,
      price: purchaseOrderItemPrice
    };

    const creatingPurchaseOrderItem = await fetch("https://groupapiproject.azurewebsites.net/api/PurchaseOrderItem", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtRetailerToken}`,
      },
      body: JSON.stringify(purchaseOrderItemDetail),
    });
    const creatingPurchaseOrderItemResult = await creatingPurchaseOrderItem.json();
    console.log('PurchaseItem added:', creatingPurchaseOrderItemResult);
    await updatePurchasesDropDown();

    document.getElementById("buyProductFromSupplierForm").reset();


  }
  else {

    const purchaseOrderObj = {
      supplierId: supplierId,
      orderDate: (new Date()).toISOString()
    }

    const creatingPurchaseOrder = await fetch("https://groupapiproject.azurewebsites.net/api/PurchaseOrder", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtRetailerToken}`,
      },
      body: JSON.stringify(purchaseOrderObj),
    });

    const justCreatedPurchaseOrder = await fetch(`https://groupapiproject.azurewebsites.net/BySupplier/${supplierId}`, {
      method: 'GET',
      headers: headers
    });

    const justCreatedPurchaseOrderInfo = await justCreatedPurchaseOrder.json();

    const justCreatedPurchaseOrderId = justCreatedPurchaseOrderInfo.id;

    const purchaseOrderItemDetail = {
      purchaseOrderId: justCreatedPurchaseOrderId,
      productId: productId,
      quantity: purchaseOrderItemQuantity,
      price: purchaseOrderItemPrice
    };

    const creatingPurchaseOrderItem = await fetch("https://groupapiproject.azurewebsites.net/api/PurchaseOrderItem", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtRetailerToken}`,
      },
      body: JSON.stringify(purchaseOrderItemDetail),
    });
    const creatingPurchaseOrderItemResult = await creatingPurchaseOrderItem.json();
    console.log('PurchaseItem added:', creatingPurchaseOrderItemResult);
    await updatePurchasesDropDown();

    document.getElementById("buyProductFromSupplierForm").reset();


  }



  // Handle the API response
  const data = await creatingPurchaseOrderItem.json();
  console.log('Form submitted:', data);

  // Optionally, reset the form after submission
  document.getElementById("supplierProductForm").reset();
}



async function updatePurchasesDropDown() {
  await populatePurchaseForPurchaseStoringDropDown();
}










///////////// ADMIN: Add customer







document.getElementById("addCustomerForm").addEventListener('submit', addCustomer);

async function addCustomer(event) {
  event.preventDefault();

  const customerName = document.getElementById("customerName").value;
  const addingCustomerObj = {
    customerName: customerName
  };
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtAdminToken) {
    headers.append("Authorization", `Bearer ${jwtAdminToken}`);
  }
  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Customer", {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(addingCustomerObj),
  });

  const data = await response.json();
  console.log("customer added", data);

}








////////// ADMIN: display suppliers and their products







// Add click event listener to the "displaySuppliersBtn" element to call the displaySuppliers function when clicked
document.getElementById("displaySuppliersBtn").addEventListener("click", displaySuppliers);

// Asynchronous function to fetch supplier data from the API
async function fetchSuppliers() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtAdminToken) {
    headers.append("Authorization", `Bearer ${jwtAdminToken}`);
  }
  // Fetch the data from the API endpoint
  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Supplier", {
    method: 'GET',
    headers: headers
  });
  // Convert the fetched data to a JSON object
  const suppliers = await response.json();
  // Return the JSON object containing the supplier data
  return suppliers;
}

// Asynchronous function to fetch product data from the API for a specific supplier
async function fetchProducts(supplierId) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtAdminToken) {
    headers.append("Authorization", `Bearer ${jwtAdminToken}`);
  }
  // Fetch the data from the API endpoint, including the supplierId in the URL
  const response = await fetch(`https://groupapiproject.azurewebsites.net/api/Product/${supplierId}`, {
    method: 'GET',
    headers: headers
  });
  // Convert the fetched data to a JSON object
  const products = await response.json();
  // Return the JSON object containing the product data
  return products;
}

// Asynchronous function to display the list of suppliers and their products
async function displaySuppliers() {
  // Get the suppliersContainer element from the HTML
  const suppliersContainer = document.getElementById("suppliersContainer");
  // Clear any existing content in the suppliersContainer
  suppliersContainer.innerHTML = "";

  // Call fetchSuppliers function to get the supplier data
  const suppliers = await fetchSuppliers();
  // Loop through each supplier object in the suppliers array
  suppliers.forEach(supplier => {
    // Create a new div element to display the supplier information
    const supplierDiv = document.createElement("div");
    supplierDiv.className = "supplier";

    // Create a new span element to display the supplier name
    const supplierName = document.createElement("span");
    supplierName.textContent = supplier.supplierName;
    // Append the supplierName element to the supplierDiv
    supplierDiv.appendChild(supplierName);

    // Create a new button element to display the "View Products" button
    const viewProductsButton = document.createElement("button");
    viewProductsButton.textContent = "View Products";
    // Add an onclick event to fetch and display products for the current supplier when clicked
    viewProductsButton.onclick = async function () {
      // Call fetchProducts function to get the product data for the current supplier
      const products = await fetchProducts(supplier.id);
      // Call displayProducts function to display the products list
      displayProducts(products, supplierDiv);
    };
    // Append the viewProductsButton element to the supplierDiv
    supplierDiv.appendChild(viewProductsButton);

    // Append the supplierDiv element to the suppliersContainer
    suppliersContainer.appendChild(supplierDiv);
  });
}

// Function to display the list of products for a specific supplier
function displayProducts(products, supplierDiv) {
  // Create a new unordered list element to display the products
  const productList = document.createElement("ul");
  // Loop through each product object in the products array
  products.forEach(product => {
    // Create a new list item element to display the product name
    const productItem = document.createElement("li");
    productItem.textContent = product.productName;
    // Append the productItem element to the productList
    productList.appendChild(productItem);
  });

  // Check if there's an existing product list in the supplierDiv
  const existingProductList = supplierDiv.querySelector("ul");
  // If there's an existing product list, replace it with the new productList
  if (existingProductList) {
    supplierDiv.replaceChild(productList, existingProductList);
  }
  else {
    // If there's no existing product list, append the new productList to the supplierDiv
    supplierDiv.appendChild(productList);
  }
}



////////////// ADMIN: display customers




document.getElementById("displayCustomersBtn").addEventListener("click", displayCustomers);


async function displayCustomers() {
  const customersContainer = document.getElementById("customersContainer");
  customersContainer.innerHTML = "";

  const customers = await fetchCustomers();

  customers.forEach((customer) => {
    const customerDiv = document.createElement("div");
    customerDiv.className = "customer";

    const customerName = document.createElement("span");
    customerName.textContent = customer.customerName;
    customerDiv.appendChild(customerName);

    customersContainer.appendChild(customerDiv);
  });
}


async function fetchCustomers() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtAdminToken) {
    headers.append("Authorization", `Bearer ${jwtAdminToken}`);
  }

  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Customer", {
    method: 'GET',
    headers: headers
  });

  const customers = await response.json();
  return customers;
}




////////// ADMIN: add supplier


document.getElementById("addSupplierForm").addEventListener('submit', addSupplier);

async function addSupplier(event) {
  event.preventDefault();

  const supplierName = document.getElementById("supplierName").value;
  const addingSupplierObj = {
    supplierName: supplierName
  };
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (jwtAdminToken) {
    headers.append("Authorization", `Bearer ${jwtAdminToken}`);
  }
  const response = await fetch("https://groupapiproject.azurewebsites.net/api/Supplier", {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(addingSupplierObj),
  });

  const data = await response.json();
  console.log("supplier added", data);

}






