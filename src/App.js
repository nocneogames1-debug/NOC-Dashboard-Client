import logo from './logo.svg';
import './App.css';
import Main from './Pages/Main';
import { AlertsProvider } from './Context/AlertsContext';
function App() {
  return (
    <div className="App">
      <AlertsProvider>
        <Main />
      </AlertsProvider>

    </div >
  );
}

export default App;
