const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const storedNumbers = [];

// Function to fetch numbers from the third-party API
async function fetchNumbers(url) {
    try {
        const response = await axios.get(url, { timeout: 500 });
        if (response.status === 200) {
            return response.data.numbers;
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
    return [];
}

// Predefined API URLs for number types
const apiUrls = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibonacci',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/random'
};

// Calculate the average of an array of numbers
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

// GET /numbers/:numberId endpoint
app.get('/numbers/:numberId', async (req, res) => {
    const { numberId } = req.params;

    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const apiUrl = apiUrls[numberId];
    const newNumbers = await fetchNumbers(apiUrl);

    if (newNumbers.length === 0) {
        return res.status(500).json({ error: 'Failed to fetch numbers' });
    }

    const windowPrevState = [...storedNumbers];
    const uniqueNumbers = newNumbers.filter(num => !storedNumbers.includes(num));

    // Update storedNumbers with uniqueNumbers, ensuring no duplicates and maintaining the window size
    for (const num of uniqueNumbers) {
        if (storedNumbers.length >= WINDOW_SIZE) {
            storedNumbers.shift(); // Remove the oldest number
        }
        storedNumbers.push(num);
    }

    const windowCurrState = [...storedNumbers];
    const avg = calculateAverage(windowCurrState);
    const response = {
        windowPrevState,
        windowCurrState,
        numbers: uniqueNumbers,
        avg: avg.toFixed(2)
    };

    res.json(response);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
