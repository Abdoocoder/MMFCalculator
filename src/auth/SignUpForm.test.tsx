import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpForm from "./SignUpForm";

const createOnSignup = vi.fn().mockResolvedValue("mem_1");
vi.mock("convex/react", () => ({
  useMutation: () => createOnSignup,
}));

beforeEach(() => {
  createOnSignup.mockClear();
});

describe("SignUpForm", () => {
  it("submits the profile to members.createOnSignup", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await user.type(screen.getByLabelText(/الرقم العضوي/), "12345");
    await user.type(screen.getByLabelText(/الاسم الكامل/), "أحمد الشوابكة");
    await user.type(screen.getByLabelText(/الرقم الوطني/), "9851023456");
    await user.type(screen.getByLabelText(/المديرية\/الدائرة/), "الهندسة");
    await user.type(screen.getByLabelText(/المسمى الوظيفي/), "رئيس قسم");
    await user.clear(screen.getByLabelText(/صافي الراتب/));
    await user.type(screen.getByLabelText(/صافي الراتب/), "200");
    await user.type(screen.getByLabelText(/رقم الهاتف/), "0791234567");
    await user.click(screen.getByRole("button", { name: /إنشاء الملف/ }));

    expect(createOnSignup).toHaveBeenCalledWith({
      profile: expect.objectContaining({
        membershipNo: "12345",
        fullName: "أحمد الشوابكة",
        nationalId: "9851023456",
        netSalary: 200,
        phone: "0791234567",
      }),
    });
    await screen.findByText(/تم إنشاء ملفك بنجاح/i);
  });

  it("validates required fields before submitting", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await user.click(screen.getByRole("button", { name: /إنشاء الملف/ }));
    expect(createOnSignup).not.toHaveBeenCalled();
    expect(screen.getAllByText(/مطلوب/).length).toBeGreaterThan(0);
  });
});
