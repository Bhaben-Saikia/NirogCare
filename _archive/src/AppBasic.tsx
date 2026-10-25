import { BrowserRouter, Routes, Route } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <header style={{ 
        borderBottom: '1px solid #e2e8f0', 
        paddingBottom: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            backgroundColor: '#10b981', 
            borderRadius: '50%' 
          }}></div>
          <h1 style={{ color: '#1f2937', fontSize: '24px', margin: 0 }}>NirogCare</h1>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '20px' 
          }}>
            Your Complete <span style={{ color: '#10b981' }}>Healthcare</span> Platform
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280', 
            marginBottom: '30px',
            maxWidth: '600px',
            margin: '0 auto 30px'
          }}>
            Find nearby pharmacies, track your health, get AI-powered insights, and manage your family's wellness.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Get Started →
            </button>
            <button 
              onClick={() => window.location.href = '/nearby-stores'}
              style={{
                backgroundColor: 'white',
                color: '#10b981',
                padding: '12px 24px',
                border: '2px solid #10b981',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Find Pharmacy
            </button>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h3 style={{ 
            textAlign: 'center', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '40px',
            color: '#1f2937'
          }}>
            Everything You Need for Better Health
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#10b981', 
                borderRadius: '50%',
                margin: '0 auto 20px'
              }}></div>
              <h4 style={{ marginBottom: '10px', color: '#1f2937' }}>Emergency Ready</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Medical ID and emergency contacts always accessible
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%',
                margin: '0 auto 20px'
              }}></div>
              <h4 style={{ marginBottom: '10px', color: '#1f2937' }}>Family Health</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Manage health for your entire family
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#8b5cf6', 
                borderRadius: '50%',
                margin: '0 auto 20px'
              }}></div>
              <h4 style={{ marginBottom: '10px', color: '#1f2937' }}>AI Insights</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Get personalized health recommendations
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '50%',
                margin: '0 auto 20px'
              }}></div>
              <h4 style={{ marginBottom: '10px', color: '#1f2937' }}>24/7 Access</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Healthcare assistance whenever you need it
              </p>
            </div>
          </div>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '30px',
            color: '#1f2937'
          }}>
            Quick Actions
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => window.location.href = '/nearby-stores'}
              style={{
                backgroundColor: 'white',
                color: '#1f2937',
                padding: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              🏥 Find Pharmacy
            </button>
            <button 
              onClick={() => window.location.href = '/symptom-checker'}
              style={{
                backgroundColor: 'white',
                color: '#1f2937',
                padding: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              🤖 Check Symptoms
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                backgroundColor: 'white',
                color: '#1f2937',
                padding: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                minWidth: '150px'
              }}
            >
              📊 Health Dashboard
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SimplePage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#10b981', fontSize: '36px', marginBottom: '20px' }}>
          🏥 NirogCare
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
          Healthcare Platform
        </p>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '15px' }}>✅ Working!</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Basic setup is successful. This is a simplified version of NirogCare.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/test" element={<SimplePage />} />
      <Route path="*" element={<SimplePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
