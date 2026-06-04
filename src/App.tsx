import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ToastContainer } from '@/components/toast';
import { theme } from '@/styles/theme';
import { appShellStyle, pageContentStyle } from '@/styles/layout';
import useBootstrapAuth from '@/hooks/useBootstrapAuth';
import usePageViewTracker from '@/hooks/usePageViewTracker';
import MainPage from './pages/MainPage';
import QuizDetailPage from './pages/quiz/QuizDetailPage';
import QuizPlayPage from './pages/quiz/QuizPlayPage';
import QuizResultPage from './pages/quiz/QuizResultPage';
import QuizCreatePage from './pages/quiz/QuizCreatePage';
import QuizEditPage from './pages/quiz/QuizEditPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import TermsAgreementPage from './pages/auth/TermsAgreementPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import ProfileLayout from './pages/profile/ProfileLayout';
import ProfileInfo from './pages/profile/ProfileInfo';
import ProfileQuizzesMade from './pages/profile/ProfileQuizzesMade';
import ProfileQuizzesPlayed from './pages/profile/ProfileQuizzesPlayed';
import ProfileQuizzesStarred from './pages/profile/ProfileQuizzesStarred';
import ProfileAccount from './pages/profile/ProfileAccount';
import PublicProfileLayout from './pages/users/PublicProfileLayout';
import PublicQuizzesMade from './pages/users/PublicQuizzesMade';
import PublicQuizzesPlayed from './pages/users/PublicQuizzesPlayed';
import AnnouncementsLayout from './pages/announcements/AnnouncementsLayout';
import AnnouncementsList from './pages/announcements/AnnouncementsList';
import AnnouncementDetail from './pages/announcements/AnnouncementDetail';
import ReleaseNotesList from './pages/announcements/ReleaseNotesList';
import ReleaseNoteDetail from './pages/announcements/ReleaseNoteDetail';
import ProtectedRoute from '@/components/protected-route/ProtectedRoute';
import GuestOnlyRoute from '@/components/guest-only-route/GuestOnlyRoute';
import TermsAgreementGate from '@/components/terms-agreement-gate';

const RouteTracker = (): null => {
  usePageViewTracker();
  return null;
};

const App = () => {
  useBootstrapAuth();
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <RouteTracker />
        <div css={appShellStyle}>
          <Header />
          <main css={pageContentStyle}>
            <Routes>
              <Route element={<TermsAgreementGate />}>
                <Route path="/" element={<Navigate to="/quiz" replace />} />
                <Route path="/quiz" element={<MainPage />} />
                <Route
                  path="/quiz/create"
                  element={
                    <ProtectedRoute>
                      <QuizCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/quiz/:id" element={<QuizDetailPage />} />
                <Route path="/quiz/:id/play" element={<QuizPlayPage />} />
                <Route path="/quiz/:id/result" element={<QuizResultPage />} />
                <Route
                  path="/quiz/:id/edit"
                  element={
                    <ProtectedRoute>
                      <QuizEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <GuestOnlyRoute>
                      <LoginPage />
                    </GuestOnlyRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <GuestOnlyRoute>
                      <SignupPage />
                    </GuestOnlyRoute>
                  }
                />
                <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
                <Route
                  path="/terms-agreement"
                  element={
                    <ProtectedRoute>
                      <TermsAgreementPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ProfileInfo />} />
                  <Route path="quizzes-made" element={<ProfileQuizzesMade />} />
                  <Route path="quizzes-played" element={<ProfileQuizzesPlayed />} />
                  <Route path="quizzes-starred" element={<ProfileQuizzesStarred />} />
                  <Route path="account" element={<ProfileAccount />} />
                </Route>
                <Route path="/profile/:userId" element={<ProfileLayout />}>
                  <Route index element={<ProfileInfo />} />
                  <Route path="quizzes-made" element={<ProfileQuizzesMade />} />
                  <Route path="quizzes-played" element={<ProfileQuizzesPlayed />} />
                </Route>
                <Route path="/users/:publicId" element={<PublicProfileLayout />}>
                  <Route index element={<Navigate to="quizzes-made" replace />} />
                  <Route path="quizzes-made" element={<PublicQuizzesMade />} />
                  <Route path="quizzes-played" element={<PublicQuizzesPlayed />} />
                </Route>
                <Route path="/announcements" element={<AnnouncementsLayout />}>
                  <Route index element={<Navigate to="notices" replace />} />
                  <Route path="notices" element={<AnnouncementsList />} />
                  <Route path="notices/:slug" element={<AnnouncementDetail />} />
                  <Route path="release-notes" element={<ReleaseNotesList />} />
                  <Route path="release-notes/:version" element={<ReleaseNoteDetail />} />
                </Route>
              </Route>
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
