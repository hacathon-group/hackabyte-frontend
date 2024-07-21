document.addEventListener('DOMContentLoaded', function() {
    const userID = localStorage.getItem('userID');

    // Function to make a POST request
    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("authToken")}` // Add JWT token
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    // Check if the user is new
    postData('http://localhost:8080/newUser', { userID })
        .then(data => {
            if (data.newUser) {
                window.location.href = '/questions'; // Redirect to the questions page
            } else {
                // Fetch the user's reservations
                postData('http://localhost:8080/getMyReservations', { userID })
                .then(reservationData => reservationData.reservations)
                    .then(reservationData => {
                        if (reservationData.length > 0) {
                            reservationData.forEach(reservation => {
                                // Fetch trail info for each reservation
                                postData('http://localhost:8080/getTrailInfo', { trailID: reservation.trailID })
                                .then(e => e.trailInfo)
                                    .then(trailData => {
                                        // Display schedule card for each reservation
                                        displaySchedule(reservation, trailData);
                                    });
                            });
                        } else {
                            alert('You have no upcoming reservations :c sending you to get some.');
                            window.location.href = '/questions';
                        }
                    });
            }
        });

    // Function to display schedule information
    function displaySchedule(reservation, trail) {
        const scheduleContainer = document.getElementById('scheduleContainer');
        const scheduleCards = document.getElementById('scheduleCards');
        
        const scheduleCard = document.createElement('div');
        scheduleCard.classList.add('schedule-card');
        
        scheduleCard.innerHTML = `
            <h4>${trail.name} (Difficulty: ${getDifficultyText(trail.difficulty)})</h4>
            <p><strong>Start Location:</strong> ${trail.startLocation}</p>
            <p><strong>End Location:</strong> ${trail.endLocation}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Date:</strong> ${reservation.date}</p>
            <p><strong>Attending:</strong> ${reservation.attending} / ${reservation.limit}</p>
            <p><a href="${trail.link}" target="_blank">Trail Details</a></p>
        `;

        scheduleCards.appendChild(scheduleCard);
        scheduleContainer.classList.remove('hidden');
    }

    // Function to convert difficulty number to text
    function getDifficultyText(difficulty) {
        switch(difficulty) {
            case 0: return 'Easy';
            case 1: return 'Medium';
            case 2: return 'Hard';
            default: return 'Unknown';
        }
    }

    // Add event listener to the "Reserve More Trails" button
    document.getElementById('reserveMoreButton').addEventListener('click', () => {
        window.location.href = '/questions';
    });
});
