import { Link } from 'react-router-dom';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="page-wrapper">
      <AuthCard title="404 - Not Found" subtitle="Requested page doesn't exist.">
        <div className="text-center space-y-6 pt-4">
          <p className="text-slate-400 text-sm">
            The link you followed might be broken, or the page may have been removed.
          </p>
          <Link to="/login" className="block">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default NotFound;
