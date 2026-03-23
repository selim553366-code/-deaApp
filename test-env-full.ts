
async function testEnv() {
  try {
    const response = await fetch('http://localhost:3000/api/env');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching env:', error);
  }
}
testEnv();
