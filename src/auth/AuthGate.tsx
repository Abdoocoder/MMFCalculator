import { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import SignInScreen from "./SignInScreen";
import SignUpForm from "./SignUpForm";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const profile = useQuery(api.members.getMyProfile);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark font-tajawal">
        <p className="text-sm text-gray-600 dark:text-gray-300">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignInScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark font-tajawal">
        <p className="text-sm text-gray-600 dark:text-gray-300">جارٍ تحميل بياناتك...</p>
      </div>
    );
  }

  if (profile === null) {
    return <SignUpForm />;
  }

  return <>{children}</>;
}
