// initUI job is to collect all the key DOM elements by id, 
// the app will interact with and return them as an object.
export function initUI(){
    return {

        userSection: document.querySelector('#user'),
        loginBtn: document.querySelector('#login'),
        logoutBtn: document.querySelector('#logout'),
        addFragmentBtn: document.querySelector('#addFragment'),
        fragmentForm: document.querySelector('#fragmentForm'),
        fragmentsSection: document.querySelector('#fragmentsTableSection'),
        fragmentsTableBody:document.querySelector('#fragmentsTable tbody'),
        typeSelect: document.getElementById("type"),
        container: document.getElementById("containerUploadContent"),
        fragmentAlertSection:document.getElementById(".fragmentAlertSection")
        
    };
} 