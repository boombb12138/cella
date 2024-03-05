import { ErrorBoundary } from '@appsignal/react';

import { appSignal } from '~/lib/appsignal';
import { AppContent } from '~/modules/common/app-content';

import HolyLoader from 'holy-loader';
import AppNav from './app-nav';
import ErrorNotice from './error-notice';
import { NavSheet } from './nav-sheet';

const App = () => {
  return (
    <ErrorBoundary instance={appSignal} fallback={(error: Error) => <ErrorNotice error={error} />}>
      <AppNav />
      <NavSheet />
      <AppContent />
      <HolyLoader />
    </ErrorBoundary>
  );
};

export default App;
