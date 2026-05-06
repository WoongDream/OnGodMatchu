import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { theme } from '@/styles/theme';
import { appShellStyle, pageContentStyle } from '@/styles/layout';
import useBootstrapAuth from '@/hooks/useBootstrapAuth';
import MainPage from './pages/MainPage';
import QuizPlayPage from './pages/quiz/QuizPlayPage';
import QuizResultPage from './pages/quiz/QuizResultPage';
import QuizCreatePage from './pages/quiz/QuizCreatePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import ProtectedRoute from '@/components/protected-route/ProtectedRoute';

const App = () => {
  useBootstrapAuth();
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div css={appShellStyle}>
          <Header />
          <main css={pageContentStyle}>
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
              <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
