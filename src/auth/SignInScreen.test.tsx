import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SignInScreen from "./SignInScreen";

const openSignIn = vi.fn();
vi.mock("@clerk/clerk-react", () => ({
  useClerk: () => ({ openSignIn }),
}));

describe("SignInScreen", () => {
  it("prompts members to sign in and opens the Clerk modal", () => {
    render(<SignInScreen />);
    expect(screen.getByText(/تسجيل الدخول/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /تسجيل الدخول/i }));
    expect(openSignIn).toHaveBeenCalled();
  });

  it("offers a link back to the public landing", () => {
    render(<SignInScreen />);
    const link = screen.getByRole("link", { name: /الرئيسية/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
