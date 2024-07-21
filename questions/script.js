// Function to get the JWT token from local storage
function getToken() {
    return localStorage.getItem("authToken")
}

if (getToken() === null) {
    alert('You must be logged in to access this page.');
    window.location.href = '/login'; // Redirect to the login page
}

document.getElementById('questionnaireForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const stairs = document.querySelector('input[name="stairs"]:checked');
    const running = document.querySelector('input[name="running"]:checked');
    
    if (!stairs || !running) {
        alert('Please answer all questions.');
        return;
    }

    let recommendedDifficulty = '';

    if (stairs.value === 'no') {
        recommendedDifficulty = 'Easy';
    } else if (stairs.value === 'yes' && running.value === 'yes') {
        recommendedDifficulty = 'Hard';
    } else if (stairs.value === 'yes') {
        recommendedDifficulty = 'Medium';
    }

    // Show the recommendation and selection modal
    document.getElementById('recommendationText').textContent = `Based on your answers, we recommend taking ${recommendedDifficulty} difficulty, but at the end of the day, it's your choice.`;
    
    // Show the difficulty selection options
    document.getElementById('difficultySelection').classList.remove('hidden');
    document.getElementById('resultModal').classList.remove('hidden');
});

document.getElementById('confirmDifficulty').addEventListener('click', function() {
    const preferredDifficulty = document.querySelector('input[name="preferredDifficulty"]:checked');
    
    if (!preferredDifficulty) {
        alert('Please select your preferred difficulty.');
        return;
    }

    // Convert selected difficulty to numerical value
    let difficultyValue = 0;
    switch (preferredDifficulty.value) {
        case 'medium':
            difficultyValue = 1;
            break;
        case 'hard':
            difficultyValue = 2;
            break;
        default:
            difficultyValue = 0;
            break;
    }
    console.log(localStorage.getItem('userID'))
    const user = localStorage.getItem('userID');
    console.log(user)
    // Send the selected difficulty to the server
    fetch('http://localhost:8080/quizResults', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ difficulty: difficultyValue, userID: user}),
    }).then(response => {
        if (response.ok) {
            alert('Your preference has been submitted!');
            // Optionally redirect or update UI
            window.location.href = '/makeReservation'; // Redirect to the results page
        } else {
            alert('Failed to submit your preference.');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('An error occurred.');
    });

    // Hide the modal after submission
    document.getElementById('resultModal').classList.add('hidden');
});

document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('resultModal').classList.add('hidden');
});
