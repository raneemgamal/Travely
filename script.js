document.addEventListener('DOMContentLoaded', function() {
    initBookingForm();
    initDestinationSlider();
    initFlightsPage();
    initHotelsPage();
});

function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    const tripTypeSelect = document.getElementById('trip-type');
    const returnDateGroup = document.querySelector('.return-date-group');
    const departureInput = document.getElementById('departure');
    const returnInput = document.getElementById('return');

    if (tripTypeSelect && returnDateGroup) {
        tripTypeSelect.addEventListener('change', function() {
            if (tripTypeSelect.value === 'one-way') {
                returnDateGroup.style.display = 'none';
                if (returnInput) returnInput.removeAttribute('required');
            } else {
                returnDateGroup.style.display = 'flex';
                if (returnInput) returnInput.setAttribute('required', 'required');
            }
        });
    }

    const counterBtns = document.querySelectorAll('.counter-btn');
    counterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            let value = parseInt(input.value) || 0;
            const min = parseInt(input.min) || 0;
            const max = parseInt(input.max) || 9;

            if (this.classList.contains('plus') && value < max) {
                value++;
            } else if (this.classList.contains('minus') && value > min) {
                value--;
            }

            input.value = value;
        });
    });

    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const origin = document.getElementById('origin').value.trim();
        const destination = document.getElementById('destination').value.trim();
        const departure = document.getElementById('departure').value;
        const tripType = tripTypeSelect ? tripTypeSelect.value : 'round-trip';
        const travelClass = document.getElementById('travel-class')?.value || 'economy';
        const adults = document.getElementById('adults')?.value || 1;
        const children = document.getElementById('children')?.value || 0;
        const infants = document.getElementById('infants')?.value || 0;

        if (!origin || !destination || !departure) {
            alert('Please fill in all required fields.');
            return;
        }

        const returnDate = tripType === 'round-trip' ? document.getElementById('return')?.value : '';
        if (tripType === 'round-trip' && !returnDate) {
            alert('Please select a return date for round trip.');
            return;
        }

        const searchParams = new URLSearchParams({
            origin: origin,
            destination: destination,
            departure: departure,
            return: returnDate,
            tripType: tripType,
            class: travelClass,
            adults: adults,
            children: children,
            infants: infants
        });

        window.location.href = `flights.html?${searchParams.toString()}`;
    });

    const today = new Date().toISOString().split('T')[0];
    if (departureInput) departureInput.setAttribute('min', today);
    if (returnInput) returnInput.setAttribute('min', today);

    if (departureInput && returnInput) {
        departureInput.addEventListener('change', function() {
            returnInput.setAttribute('min', this.value);
        });
    }
}

function initDestinationSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const sliderCards = document.querySelectorAll('.slider-card');

    if (!sliderTrack || !prevBtn || !nextBtn || !sliderWrapper) return;

    let currentIndex = 0;
    const gap = 20;

    function getCardWidth() {
        const firstCard = sliderCards[0];
        if (!firstCard) return 280;
        return firstCard.offsetWidth;
    }

    function getVisibleCards() {
        const wrapperWidth = sliderWrapper.offsetWidth;
        const cardWidth = getCardWidth();
        return Math.floor(wrapperWidth / (cardWidth + gap)) || 1;
    }

    function getMaxIndex() {
        const visibleCards = getVisibleCards();
        return Math.max(0, sliderCards.length - visibleCards);
    }

    function updateSlider() {
        const cardWidth = getCardWidth();
        const offset = currentIndex * (cardWidth + gap);
        sliderTrack.style.transform = `translateX(-${offset}px)`;
        
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= getMaxIndex();
    }

    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', function() {
        if (currentIndex < getMaxIndex()) {
            currentIndex++;
            updateSlider();
        }
    });

    sliderCards.forEach(card => {
        card.addEventListener('click', function() {
            const city = this.dataset.city;
            const destinationInput = document.getElementById('destination');
            if (destinationInput && city) {
                destinationInput.value = city;
                destinationInput.focus();
                
                document.querySelector('.hero-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });

        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });

    updateSlider();
    
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            currentIndex = Math.min(currentIndex, getMaxIndex());
            updateSlider();
        }, 100);
    });
}

const mockFlights = [
    { id: 1, airline: 'Emirates', departure: '08:00', arrival: '14:30', duration: '6h 30m', price: 450, class: 'economy' },
    { id: 2, airline: 'Qatar Airways', departure: '10:15', arrival: '17:00', duration: '6h 45m', price: 520, class: 'economy' },
    { id: 3, airline: 'Lufthansa', departure: '14:00', arrival: '20:15', duration: '6h 15m', price: 480, class: 'economy' },
    { id: 4, airline: 'British Airways', departure: '16:30', arrival: '23:00', duration: '6h 30m', price: 510, class: 'economy' },
    { id: 5, airline: 'Emirates', departure: '09:00', arrival: '15:00', duration: '6h 00m', price: 1200, class: 'business' },
    { id: 6, airline: 'Qatar Airways', departure: '11:30', arrival: '18:00', duration: '6h 30m', price: 1350, class: 'business' },
    { id: 7, airline: 'Etihad', departure: '07:00', arrival: '13:30', duration: '6h 30m', price: 2500, class: 'first' },
    { id: 8, airline: 'Singapore Airlines', departure: '20:00', arrival: '02:30', duration: '6h 30m', price: 2800, class: 'first' }
];

function initFlightsPage() {
    const flightsResults = document.getElementById('flights-results');
    if (!flightsResults) return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchInfo = document.getElementById('search-info');
    
    if (urlParams.has('origin') && urlParams.has('destination')) {
        const origin = urlParams.get('origin');
        const destination = urlParams.get('destination');
        const departure = urlParams.get('departure');
        const returnDate = urlParams.get('return');
        const tripType = urlParams.get('tripType') || 'round-trip';
        const travelClass = urlParams.get('class') || 'economy';
        const adults = urlParams.get('adults') || 1;
        const children = urlParams.get('children') || 0;
        const infants = urlParams.get('infants') || 0;

        if (searchInfo) {
            let tripInfo = `Date: ${formatDate(departure)}`;
            if (tripType === 'round-trip' && returnDate) {
                tripInfo += ` - ${formatDate(returnDate)}`;
            }
            
            let travelerInfo = `${adults} Adult(s)`;
            if (parseInt(children) > 0) travelerInfo += `, ${children} Child(ren)`;
            if (parseInt(infants) > 0) travelerInfo += `, ${infants} Infant(s)`;
            
            searchInfo.innerHTML = `
                <p><strong>${origin}</strong> to <strong>${destination}</strong> (${capitalizeFirst(tripType)})</p>
                <p>${tripInfo} | ${travelerInfo} | Class: ${capitalizeFirst(travelClass)}</p>
            `;
        }

        displayFlights(origin, destination, travelClass, departure, returnDate, tripType, adults, children, infants);
    } else {
        displayFlights('New York', 'Paris', 'economy');
        if (searchInfo) {
            searchInfo.innerHTML = '<p>Showing sample flights. Use the search form above to find specific routes.</p>';
        }
    }

    const flightSearchForm = document.getElementById('flight-search-form');
    if (flightSearchForm) {
        const today = new Date().toISOString().split('T')[0];
        const departureInput = document.getElementById('flight-departure');
        if (departureInput) departureInput.setAttribute('min', today);

        flightSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const origin = document.getElementById('flight-origin').value;
            const destination = document.getElementById('flight-destination').value;
            const departure = document.getElementById('flight-departure').value;
            const travelClass = document.getElementById('flight-class').value;

            if (!origin || !destination || !departure) {
                alert('Please fill in all required fields.');
                return;
            }

            const searchParams = new URLSearchParams({
                origin: origin,
                destination: destination,
                departure: departure,
                tripType: 'one-way',
                class: travelClass,
                adults: 1,
                children: 0,
                infants: 0
            });

            window.location.href = `flights.html?${searchParams.toString()}`;
        });
    }
}

async function displayFlights(origin, destination, travelClass, departure, returnDate, tripType, adults, children, infants) {
    const flightsResults = document.getElementById('flights-results');
    if (!flightsResults) return;

    flightsResults.innerHTML = '<div class="no-results"><p>Searching for flights...</p></div>';

    try {
        const userId = localStorage.getItem('userId') || null;

        const response = await fetch('/api/flights/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin,
                destination,
                departure,
                return: returnDate,
                tripType: tripType || 'round-trip',
                class: travelClass || 'economy',
                adults: parseInt(adults) || 1,
                children: parseInt(children) || 0,
                infants: parseInt(infants) || 0,
                userId
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Search failed');
        }

        const flights = data.flights || [];

        if (flights.length === 0) {
            flightsResults.innerHTML = '<div class="no-results"><p>No flights found for your search criteria.</p></div>';
            return;
        }

        let html = '<div class="results-grid">';
        flights.forEach(flight => {
            const departureTime = flight.departure_time || flight.departure || 'N/A';
            const arrivalTime = flight.arrival_time || flight.arrival || 'N/A';
            const price = flight.price || flight.price_per_person || 0;
            
            html += `
                <div class="flight-card">
                    <div class="flight-card-header">
                        <span class="airline-name">${flight.airline}</span>
                        <span class="flight-class">${capitalizeFirst(flight.travel_class || travelClass)}</span>
                    </div>
                    <div class="flight-card-body">
                        <div class="flight-times">
                            <div class="time-block">
                                <div class="time">${departureTime}</div>
                                <div class="city">${origin}</div>
                            </div>
                            <div class="flight-arrow">&#10132;</div>
                            <div class="time-block">
                                <div class="time">${arrivalTime}</div>
                                <div class="city">${destination}</div>
                            </div>
                        </div>
                        <div class="flight-duration">Duration: ${flight.duration || 'N/A'}</div>
                        <div class="flight-price">
                            <div>
                                <div class="price-amount">$${price}</div>
                                <div class="price-label">per person</div>
                            </div>
                            <button class="book-btn" onclick="bookFlight(${JSON.stringify({
                                origin, destination, departureDate: departure, returnDate, tripType, travelClass,
                                airline: flight.airline, departureTime, arrivalTime, duration: flight.duration,
                                price, adults, children, infants
                            }).replace(/"/g, '&quot;')})">Select</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        flightsResults.innerHTML = html;
    } catch (error) {
        console.error('Error searching flights:', error);
        flightsResults.innerHTML = `<div class="no-results"><p>Error: ${error.message}</p></div>`;
    }
}

const mockHotels = [
    { id: 1, name: 'Grand Palace Hotel', stars: 5, price: 350, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', location: 'City Center' },
    { id: 2, name: 'Seaside Resort & Spa', stars: 5, price: 420, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', location: 'Beachfront' },
    { id: 3, name: 'Urban Comfort Inn', stars: 4, price: 180, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', location: 'Downtown' },
    { id: 4, name: 'The Heritage Hotel', stars: 4, price: 220, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', location: 'Historic District' },
    { id: 5, name: 'Budget Stay Express', stars: 3, price: 89, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400', location: 'Near Airport' },
    { id: 6, name: 'Luxury Suites Tower', stars: 5, price: 550, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', location: 'Financial District' }
];

function initHotelsPage() {
    const hotelSearchForm = document.getElementById('hotel-search-form');
    const hotelsResults = document.getElementById('hotels-results');

    if (!hotelsResults) return;

    displayHotels('', '', '', 2, 1);

    if (hotelSearchForm) {
        const today = new Date().toISOString().split('T')[0];
        const checkinInput = document.getElementById('hotel-checkin');
        const checkoutInput = document.getElementById('hotel-checkout');
        
        if (checkinInput) checkinInput.setAttribute('min', today);
        if (checkoutInput) checkoutInput.setAttribute('min', today);

        if (checkinInput && checkoutInput) {
            checkinInput.addEventListener('change', function() {
                checkoutInput.setAttribute('min', this.value);
            });
        }

        hotelSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const city = document.getElementById('hotel-city').value;
            const checkin = document.getElementById('hotel-checkin').value;
            const checkout = document.getElementById('hotel-checkout').value;
            const guests = document.getElementById('hotel-guests').value;
            const rooms = document.getElementById('hotel-rooms').value;

            if (!city || !checkin || !checkout) {
                alert('Please fill in all required fields.');
                return;
            }

            displayHotels(city, checkin, checkout, guests, rooms);
        });
    }
}

async function displayHotels(city = '', checkin = '', checkout = '', guests = 2, rooms = 1) {
    const hotelsResults = document.getElementById('hotels-results');
    if (!hotelsResults) return;

    hotelsResults.innerHTML = '<div class="no-results"><p>Searching for hotels...</p></div>';

    try {
        const userId = localStorage.getItem('userId') || null;

        const response = await fetch('/api/hotels/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                city,
                checkin: checkin || new Date().toISOString().split('T')[0],
                checkout: checkout || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                guests: parseInt(guests) || 2,
                rooms: parseInt(rooms) || 1,
                userId
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Search failed');
        }

        const hotels = data.hotels || [];

        if (hotels.length === 0) {
            hotelsResults.innerHTML = '<div class="no-results"><p>No hotels found for your search criteria.</p></div>';
            return;
        }

        let html = '<div class="results-grid">';
        hotels.forEach(hotel => {
            const stars = '&#9733;'.repeat(hotel.stars || 3) + '&#9734;'.repeat(5 - (hotel.stars || 3));
            const price = hotel.price_per_night || hotel.price || 0;
            const image = hotel.image_url || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
            
            html += `
                <div class="hotel-card">
                    <img src="${image}" alt="${hotel.name}" loading="lazy">
                    <div class="hotel-card-body">
                        <h3 class="hotel-name">${hotel.name}</h3>
                        <div class="hotel-rating">${stars}</div>
                        <p class="hotel-location">${hotel.location || ''}${city ? ', ' + city : ''}</p>
                        <div class="hotel-price">
                            <div>
                                <div class="price-amount">$${price}</div>
                                <div class="price-label">per night</div>
                            </div>
                            <button class="book-btn" onclick="bookHotel(${JSON.stringify({
                                hotelName: hotel.name, city, location: hotel.location,
                                checkinDate: checkin, checkoutDate: checkout, guests, rooms,
                                pricePerNight: price, stars: hotel.stars
                            }).replace(/"/g, '&quot;')})">Book Now</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        hotelsResults.innerHTML = html;
    } catch (error) {
        console.error('Error searching hotels:', error);
        hotelsResults.innerHTML = `<div class="no-results"><p>Error: ${error.message}</p></div>`;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}


async function bookFlight(flightData) {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        if (!confirm('You need to be logged in to book a flight. Redirect to login?')) {
            return;
        }
        window.location.href = 'login.html';
        return;
    }

    if (!confirm(`Book ${flightData.airline} flight from ${flightData.origin} to ${flightData.destination} for $${flightData.price}?`)) {
        return;
    }

    try {
        const response = await fetch('/api/flights/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                ...flightData
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Booking failed');
        }

        alert(`✅ ${data.message}\nBooking ID: ${data.bookingId}`);
    } catch (error) {
        console.error('Error booking flight:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

async function bookHotel(hotelData) {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        if (!confirm('You need to be logged in to book a hotel. Redirect to login?')) {
            return;
        }
        window.location.href = 'login.html';
        return;
    }

    const checkin = new Date(hotelData.checkinDate);
    const checkout = new Date(hotelData.checkoutDate);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    const totalPrice = hotelData.pricePerNight * nights * hotelData.rooms;

    if (!confirm(`Book ${hotelData.hotelName} for ${nights} night(s) at $${hotelData.pricePerNight}/night?\nTotal: $${totalPrice}`)) {
        return;
    }

    try {
        const response = await fetch('/api/hotels/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                ...hotelData
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Booking failed');
        }

        alert(`✅ ${data.message}\nBooking ID: ${data.bookingId}`);
    } catch (error) {
        console.error('Error booking hotel:', error);
        alert(`❌ Error: ${error.message}`);
    }
}