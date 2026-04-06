import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout';
import { theme } from '@/styles/theme';
import MainPage from './pages/MainPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizCreatePage from './pages/QuizCreatePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/quiz/create" element={<QuizCreatePage />} />
            <Route path="/quiz/:id" element={<QuizPlayPage />} />
            <Route path="/quiz/:id/result" element={<QuizResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
