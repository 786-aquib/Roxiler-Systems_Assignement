const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

var seedData = []; // In-memory array to store seed data

app.get('/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json'); 
    
    const data = response.data;
    seedData.length = 0;

    data.forEach((item) => {
      seedData.push(item);
    });
    res.status(200).json({ message: 'Database initialized successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while initializing the database.' });
  }
});


// ...Statistics... //


app.get('/statistics', (req, res) => {
  const { month } = req.query; // Assuming the month is passed as a query parameter

  // Filter the seedData array based on the month
  const filteredData = seedData.filter((item) => {
    const itemMonth = new Date(item.dateOfSale).getMonth();
    return itemMonth === parseInt(month) - 1; // JavaScript months are zero-based
  });

  const totalSaleAmount = filteredData.reduce((sum, item) => sum + item.price, 0);
  const totalSoldItems = filteredData.length;
  const totalNotSoldItems = seedData.length - totalSoldItems;

  res.status(200).json({
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems,
  });
});


// ...Bar Chart... //



app.get('/barChart', (req, res) => {
  const { month } = req.query;

  const filteredData = seedData.filter((item) => {
    const itemMonth = new Date(item.dateOfSale).getMonth();
    return itemMonth === parseInt(month) - 1;
});
   const priceRanges = [
    { range: '0 - 100', count: 0 },
    { range: '101 - 200', count: 0 },
    { range: '201 - 300', count: 0 },
    { range: '301 - 400', count: 0 },
    { range: '401 - 500', count: 0 },
    { range: '501 - 600', count: 0 },
    { range: '601 - 700', count: 0 },
    { range: '701 - 800', count: 0 },
    { range: '801 - 900', count: 0 },
    { range: '901 - above', count: 0 },
  ];

  filteredData.forEach((item) => {
    const price = item.price;
    if (price >= 0 && price <= 100) {
      priceRanges[0].count++;
    } else if (price >= 101 && price <= 200) {
      priceRanges[1].count++;
    } else if (price >= 201 && price <= 300) {
      priceRanges[2].count++;
    }else if (price >= 301 && price <= 400) {
      priceRanges[3].count++;
    }else if (price >= 401 && price <= 500) {
      priceRanges[4].count++;
    }else if (price >= 501 && price <= 600) {
      priceRanges[5].count++;
    }else if (price >= 601 && price <= 700) {
      priceRanges[6].count++;
    }else if (price >= 701 && price <= 800) {
      priceRanges[7].count++;
    }else if (price >= 801 && price <= 900) {
      priceRanges[8].count++;
    }else {
      priceRanges[9].count++;
    }
  });
  res.status(200).json(priceRanges);
});

// ...Pie Chart... //


app.get('/pieChart', (req, res) => {
  const { month } = req.query;

  const filteredData = seedData.filter((item) => {
    const itemMonth = new Date(item.dateOfSale).getMonth();
    return itemMonth === parseInt(month) - 1;
  });

  const categoryCount = {};

  filteredData.forEach((item) => {
    const category = item.category;
    if (category in categoryCount) {
      categoryCount[category]++;
    } else {
      categoryCount[category] = 1;
    }
  });
  console.log(categoryCount);
  res.status(200).json(categoryCount);
});

// ...Total Combined... //


app.get('/combined', async (req, res) => {
  const { month } = req.query;

try {
    const statisticsResponse = await axios.get(`http://localhost:3000/statistics? 
              month=${month}`);
    const barChartResponse = await axios.get(`http://localhost:3000/barChart?month=${month}`);
    const pieChartResponse = await axios.get(`http://localhost:3000/pieChart?month=${month}`);

    const combinedResponse = {
      statistics: statisticsResponse.data,
      barChart: barChartResponse.data,
      pieChart: pieChartResponse.data,
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the combined data.' });
  }
});

// ...