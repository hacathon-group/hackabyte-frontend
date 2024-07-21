// login/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Switch between login and signup forms
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.toggle('hidden', form.id !== `${tab}Form`);
            });
            tabButtons.forEach(btn => btn.classList.toggle('active', btn === button));
        });
    });

    // Handle signup
    document.getElementById('signup').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                alert('Signup successful! Redirecting to questionnaire...');
                localStorage.setItem('userID', data);
                window.location.href = '/questions/index.html'; // Redirect to the questions page
            } else {
                const data = await response.json();
                alert("Go to login page and sign in!")
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('An error occurred during signup.');
        }
    });

    // Handle login
    document.getElementById('login').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.text();
                localStorage.setItem('userID', data); // Store JWT token in local storage
                console.log(data.token)
                window.location.href = '/dashboard'; // Redirect to the questions page
            } else {
                const data = await response.json();
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    });
});
