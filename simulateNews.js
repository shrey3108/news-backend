const io = require('socket.io-client');

const socket = io('http://localhost:5000');

const categories = ['Tech', 'Business', 'Sports', 'Entertainment', 'General'];
const titles = [
  'Breaking News: Major Tech Breakthrough',
  'Global Market Trends Revealed',
  'Sports Team Wins Championship',
  'Hollywood Celebrity Announces Retirement',
  'Scientific Discovery Shocks Researchers'
];

function generateRandomNews() {
  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date()
  };
}

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Simulate news every 5 seconds
  setInterval(() => {
    const news = generateRandomNews();
    socket.emit('news', news);
    console.log('Simulated News:', news);
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.error('Connection Error:', error);
});
