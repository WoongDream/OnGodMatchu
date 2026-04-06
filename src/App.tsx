import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizCreatePage from './pages/QuizCreatePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/quiz/create" element={<QuizCreatePage />} />
        <Route path="/quiz/:id" element={<QuizPlayPage />} />
        <Route path="/quiz/:id/result" element={<QuizResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
