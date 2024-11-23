let balance = 1000;

function updateBalance(amount) {
    balance += amount;
    document.getElementById("wallet").innerText = `Balance: $${balance}`;
}

document.addEventListener("DOMContentLoaded", () => {
    updateBalance(0); // Display initial balance
});
