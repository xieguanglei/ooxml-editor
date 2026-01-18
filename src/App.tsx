import { AppProvider, useAppState } from './context';
import { FileUploader } from './components/FileUploader';
import { EditorLayout } from './components/EditorLayout';

function AppContent() {
  const { state } = useAppState();
  
  if (state.tree) {
    return <EditorLayout />;
  }
  
  return <FileUploader />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
