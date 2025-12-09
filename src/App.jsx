import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppRouter from './router/AppRouter';
import Toast from './components/Toast';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
        <Toast />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
