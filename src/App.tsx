import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '@/components/header';
import { theme } from '@/styles/theme';
import { AppShell, PageContent } from '@/styles/layout';
import MainPage from './pages/MainPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizCreatePage from './pages/QuizCreatePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from '@/components/protected-route/ProtectedRoute';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppShell>
          <Header />
          <PageContent>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route
                path="/quiz/create"
                element={
                  <ProtectedRoute>
                    <QuizCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/quiz/:id" element={<QuizPlayPage />} />
              <Route path="/quiz/:id/result" element={<QuizResultPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </PageContent>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
