document.getElementById('signup-form').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value.trim();

  if (!email) {
      alert('Please enter a valid email.');
      return;
  }

  try {
      const response = await fetch('http://localhost:5000/api/auth/send-verification', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
          window.location.href = 'dashboard.html';
      }
  } catch (error) {
      console.error('Error submitting email:', error);
      alert('Something went wrong. Please try again.');
  }
});
