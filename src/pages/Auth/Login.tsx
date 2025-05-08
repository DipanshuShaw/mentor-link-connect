
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      // Error is handled in the login function via toast
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // For demo purposes
  const handleDemoLogin = async (role: string) => {
    const demoCredentials = {
      admin: { email: "admin@example.com", password: "password" },
      mentor: { email: "mentor@example.com", password: "password" },
      student: { email: "student@example.com", password: "password" }
    };

    setEmail(demoCredentials[role as keyof typeof demoCredentials].email);
    setPassword(demoCredentials[role as keyof typeof demoCredentials].password);
    
    // Small delay to show the populated fields before submitting
    setTimeout(() => {
      toast.info(`Logging in as ${role}...`);
      login(
        demoCredentials[role as keyof typeof demoCredentials].email, 
        demoCredentials[role as keyof typeof demoCredentials].password
      )
        .then(() => navigate("/dashboard"))
        .catch(console.error);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-primary/10 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
            >
              <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
              <path d="M12 13v9" />
              <path d="M12 2v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Student Mentorship Portal</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Demo accounts section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Demo Accounts</CardTitle>
            <CardDescription>
              Click to log in with pre-configured demo accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left border-admin"
              onClick={() => handleDemoLogin("admin")}
            >
              <span className="bg-admin/10 text-admin p-1 rounded mr-2">Admin</span>
              <span className="truncate">admin@example.com</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left border-mentor"
              onClick={() => handleDemoLogin("mentor")}
            >
              <span className="bg-mentor/10 text-mentor p-1 rounded mr-2">Mentor</span>
              <span className="truncate">mentor@example.com</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left border-student"
              onClick={() => handleDemoLogin("student")}
            >
              <span className="bg-student/10 text-student p-1 rounded mr-2">Student</span>
              <span className="truncate">student@example.com</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
