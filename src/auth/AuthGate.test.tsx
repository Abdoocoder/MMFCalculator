import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthGate from "./AuthGate";

const mocks = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
  profile: { _id: "mem_1", userId: "user_1" } as { _id: string; userId: string } | null,
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isLoaded: mocks.isLoaded, isSignedIn: mocks.isSignedIn }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => mocks.profile,
}));

vi.mock("./SignInScreen", () => ({
  default: () => <div data-testid="sign-in-screen" />,
}));

vi.mock("./SignUpForm", () => ({
  default: () => <div data-testid="sign-up-form" />,
}));

describe("AuthGate", () => {
  beforeEach(() => {
    mocks.isLoaded = true;
    mocks.isSignedIn = true;
    mocks.profile = { _id: "mem_1", userId: "user_1" };
  });

  it("shows a loading screen while Clerk is not loaded", () => {
    mocks.isLoaded = false;
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByText(/جارٍ التحميل/)).toBeInTheDocument();
    expect(screen.queryByTestId("member-app")).not.toBeInTheDocument();
  });

  it("shows the sign-in screen when signed out", () => {
    mocks.isSignedIn = false;
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByTestId("sign-in-screen")).toBeInTheDocument();
  });

  it("shows the sign-up form on first login (no profile row yet)", () => {
    mocks.profile = null;
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByTestId("sign-up-form")).toBeInTheDocument();
  });

  it("renders the member app when signed in with a profile", () => {
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByTestId("member-app")).toBeInTheDocument();
  });
});
