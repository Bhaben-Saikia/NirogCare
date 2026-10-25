import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#10b981', fontSize: '2rem' }}>NirogCare Test</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>Healthcare Platform</p>
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <h2>✅ React is working!</h2>
        <p>If you can see this, the basic React setup is working.</p>
      </div>
    </div>
  );
}

export default App;
