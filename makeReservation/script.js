document.addEventListener('DOMContentLoaded', function() {
    const userID = localStorage.getItem('userID');
    
    // Redirect to login if userID is not available
    if (!userID) {
        alert('You must be logged in to access this page.');
        window.location.href = '/login'; // Redirect to the login page
        return;
    }

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

    // Fetch available reservations
    postData('http://localhost:8080/getReservations', { userID })
        .then(reservationData => reservationData.reservations)
        .then(reservationData => {
            console.log(reservationData);
            
            if (reservationData.length > 0) {
                reservationData.forEach(reservation => {
                    // Fetch trail info for each reservation
                    postData('http://localhost:8080/getTrailInfo', { trailID: reservation.trailID })
                    .then(e => e.trailInfo)
                    .then(trailData => {
                            // Display reservation card with trail info
                            displayReservation(reservation, trailData);
                        });
                });
            } else {
                document.getElementById('reservationsContainer').innerHTML = '<p>No reservations available at the moment.</p>';
            }
        });

    // Function to display reservation information
    function displayReservation(reservation, trail) {
        const reservationsContainer = document.getElementById('reservationsContainer');
        
        const reservationCard = document.createElement('div');
        reservationCard.classList.add('reservation-card');
        
        // Encode the locations for the map URL
        const startLocationEncoded = encodeURIComponent(trail.startLocation);
        const endLocationEncoded = encodeURIComponent(trail.endLocation);

        // Embed map with markers for start and end locations
        reservationCard.innerHTML = `
            <h4>${trail.name} (Difficulty: ${getDifficultyText(trail.difficulty)})</h4>
            <p><strong>Start Location:</strong> ${trail.startLocation}</p>
            <p><strong>End Location:</strong> ${trail.endLocation}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Date:</strong> ${reservation.date}</p>
            <p><strong>Attending:</strong> ${reservation.attending} / ${reservation.limit}</p>
            <div class="map-container">
                <iframe
                    width="600"
                    height="450"
                    style="border:0"
                    loading="lazy"
                    allowfullscreen
                    src="https://www.google.com/maps?q=${encodeURIComponent(trail.startLocation)}&z=15&output=embed">
                </iframe>
            </div>
            <p><a href="${trail.link}" target="_blank">Trail Details</a></p>
            <button class="reserveButton" data-reservation-id="${reservation.reservationID}">Reserve</button>
        `;

        reservationsContainer.appendChild(reservationCard);
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

    // Add event listener to handle reservation button click
    document.getElementById('reservationsContainer').addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('reserveButton')) {
            const reservationID = e.target.getAttribute('data-reservation-id');
            // Make API call to reserve the spot
            postData('http://localhost:8080/newReservation', { userID, reservationID })
                .then(response => {
                    if (response.success) {
                        alert('Reservation successful!');
                        // Optionally update UI or redirect
                        window.location.href = '/dashboard'; // Reload the page to update the list
                    } else {
                        alert('Failed to make reservation.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred.');
                });
        }
    });

    // Add the "Go to Dashboard" button at the top right
    const dashboardButton = document.createElement('button');
    dashboardButton.textContent = 'Go to Dashboard';
    dashboardButton.classList.add('dashboardButton');
    dashboardButton.addEventListener('click', () => {
        window.location.href = '/dashboard'; // Redirect to the dashboard
    });

    document.querySelector('.container').appendChild(dashboardButton);
});
