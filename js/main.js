const loginFormButton = document.getElementById('login-button');
const loginForm = document.getElementById('login-form');

const createAccountFormButton = document.getElementById('create-account-button');
const createAccountForm = document.getElementById('create-account-form');

const loginSubmitButton = document.getElementById('login-submit-button');
const createAccountSubmitButton = document.getElementById('create-account-submit-button');

let jwtAdminToken;
let jwtRetailerToken;

loginForm.classList.remove("hidden");

loginFormButton.addEventListener('click', (event) => {
    event.preventDefault();

    loginForm.classList.remove('hidden');
    createAccountForm.classList.add('hidden');
});


createAccountFormButton.addEventListener('click', (event) => {
    event.preventDefault();

    loginForm.classList.add('hidden');
    createAccountForm.classList.remove('hidden');
});

loginSubmitButton.addEventListener('click', (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    let adminUsername = username + 'A';
    let retailerUsername = username + "R";
    const password = document.getElementById('login-password').value;
    console.log('Submitting login form');

    // handle api call
    fetch('https://groupapiproject.azurewebsites.net/api/TokenAdmin', {
        method: 'Post',
        body: JSON.stringify({ username: adminUsername, password: password }),
        headers: {

            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('TokenRetailer response received');
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json()
        })
        .then(data => {
            // Handle the response data
            jwtAdminToken = data.token;

            fetch('https://groupapiproject.azurewebsites.net/api/TokenRetailer', {
                method: 'Post',
                body: JSON.stringify({ username: retailerUsername, password: password }),
                headers: {

                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    // Handle the response data
                    jwtRetailerToken = data.token;
                    window.localStorage.setItem('jwtAdminToken', jwtAdminToken);
                    window.localStorage.setItem('jwtRetailerToken', jwtRetailerToken);
                    window.location.href = './adminRetailerPage.html';
                    
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error in fetching TokenRetailer:', error);
                });

        })
        .catch(error => {
            // Handle any errors
            console.error('Error in fetching TokenAdmin:', error);
        });





})
createAccountSubmitButton.addEventListener('click', (event) => {
    event.preventDefault();
    const username = document.getElementById('create-username').value;
    console.log("username: ", username);
    let adminUsername = username + 'A';
    let retailerUsername = username + "R";
    const password = document.getElementById('create-password').value;
    // handle api call
    fetch('https://groupapiproject.azurewebsites.net/api/User/Register', {
        method: 'Post',
        body: JSON.stringify({ role: "Admin", userName: adminUsername, password: password }),
        headers: {

            'Content-Type': 'application/json'
        }
    });
    fetch('https://groupapiproject.azurewebsites.net/api/User/Register', {
        method: 'Post',
        body: JSON.stringify({ role: "Retailer", userName: retailerUsername, password: password }),
        headers: {

            'Content-Type': 'application/json'
        }
    });
})



