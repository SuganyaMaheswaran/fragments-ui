export function initUI(){
    return {
        userSection: document.querySelector('#user'),
        loginBtn: document.querySelector('#login'),
        lougoutBtn: document.querySelector('#logout'),
        addFragmentBtn: document.querySelector('#addFragment'),
        fragmentForm: document.querySelector('#fragmentForm'),
        fragmentsSection: document.querySelector('#fragmentSection'),
        fargmentsTableBody:document.querySelector('#fragmentsTable tbody'),
        typeSelect: document.getElementById("type")
    };
}