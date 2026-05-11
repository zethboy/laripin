import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, onRedirect }) {
  const { currentUser, isGuest } = useAuth();

  if (!currentUser && !isGuest) {
    onRedirect();
    return null;
  }

  return children;
}
