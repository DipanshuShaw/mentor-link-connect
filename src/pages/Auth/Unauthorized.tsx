
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-primary/10 px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="rounded-full bg-destructive/10 p-3 mx-auto w-16 h-16 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
        <p className="text-xl">
          You don't have permission to access this page.
        </p>
        <p className="text-muted-foreground">
          Please contact the administrator if you believe this is an error.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
