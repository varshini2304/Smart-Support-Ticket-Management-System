import { useState, useEffect } from 'react';

function App() {
  const [serverStatus, setServerStatus] = useState('Loading...');

  useEffect(() => {
    // Check server health on component mount
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerStatus(`Server: ${data.status}`))
      .catch((err) => setServerStatus(`Error: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Smart Support Ticket Management System</h1>
      <p>Phase 1: Environment Setup Complete</p>
      <p style={{ color: 'green' }}>{serverStatus}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Frontend and backend are initialized. Phase 2 will implement authentication and ticket management.
      </p>
    </div>
  );
}

export default App;
