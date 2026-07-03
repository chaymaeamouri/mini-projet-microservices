import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [services, setServices] = useState({
    service1: { name: 'Service Authentication (Port 8001)', status: 'checking', data: null, error: null, url: 'http://localhost:8001/api/status' },
    service2: { name: 'Service Students (Port 8002)', status: 'checking', data: null, error: null, url: 'http://localhost:8002/api/status' },
  });

  const checkService = async (key) => {
    setServices(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'checking', error: null }
    }));

    const startTime = Date.now();
    try {
      const response = await fetch(services[key].url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      const latency = Date.now() - startTime;
      
      setServices(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'online',
          data: json,
          latency: `${latency}ms`
        }
      }));
    } catch (err) {
      setServices(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'offline',
          error: err.message || 'Impossible de se connecter au service',
          data: null
        }
      }));
    }
  };

  const checkAllServices = () => {
    checkService('service1');
    checkService('service2');
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Microservices Portal</h1>
          <p>React Frontend + Symfony Backend APIs Integration</p>
        </div>
        <button className="btn btn-primary" onClick={checkAllServices}>
          Rafraîchir tout
        </button>
      </header>

      <main className="dashboard-grid">
        {Object.entries(services).map(([key, service]) => (
          <div key={key} className={`service-card ${service.status}`}>
            <div className="card-header">
              <span className={`status-indicator ${service.status}`}></span>
              <h3>{service.name}</h3>
            </div>
            
            <div className="card-body">
              <div className="meta-info">
                <span className="meta-label">Status:</span>
                <span className={`meta-value status-text ${service.status}`}>
                  {service.status.toUpperCase()}
                </span>
              </div>
              
              {service.status === 'online' && service.latency && (
                <div className="meta-info">
                  <span className="meta-label">Latence:</span>
                  <span className="meta-value text-accent">{service.latency}</span>
                </div>
              )}

              <div className="api-url">
                <code>GET {service.url}</code>
              </div>

              <div className="response-box">
                <div className="response-title">Réponse API:</div>
                <pre>
                  {service.status === 'checking' && <span className="loading-text">Connexion en cours...</span>}
                  {service.status === 'offline' && <span className="error-text">Hors ligne : {service.error}</span>}
                  {service.status === 'online' && JSON.stringify(service.data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="card-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => checkService(key)}
                disabled={service.status === 'checking'}
              >
                Tester à nouveau
              </button>
            </div>
          </div>
        ))}
      </main>

      <footer className="dashboard-footer">
        <p>Développé avec React 19 & Symfony 7.4 • Mode Découplé avec CORS activé</p>
      </footer>
    </div>
  );
}

export default App;
