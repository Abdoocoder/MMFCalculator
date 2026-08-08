import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const EMPTY = {
  membershipNo: "",
  fullName: "",
  nationalId: "",
  department: "",
  jobTitle: "",
  netSalary: "",
  currentDeductions: "0",
  phone: "",
  joinDate: new Date().toISOString().split("T")[0],
  activeLoanCount: 0,
  totalLoansPaid: 0,
};

export default function SignUpForm() {
  const createOnSignup = useMutation(api.members.createOnSignup);
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const required: (keyof typeof EMPTY)[] = [
    "membershipNo",
    "fullName",
    "nationalId",
    "department",
    "jobTitle",
    "netSalary",
    "phone",
  ];

  const set = (field: keyof typeof EMPTY, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const missing: Record<string, boolean> = {};
    for (const key of required) {
      if (!String(form[key]).trim()) missing[key] = true;
    }
    setErrors(missing);
    if (Object.keys(missing).length > 0) return;

    setSubmitting(true);
    await createOnSignup({
      profile: {
        membershipNo: form.membershipNo.trim(),
        fullName: form.fullName.trim(),
        nationalId: form.nationalId.trim(),
        department: form.department.trim(),
        jobTitle: form.jobTitle.trim(),
        netSalary: Number(form.netSalary),
        currentDeductions: Number(form.currentDeductions || 0),
        phone: form.phone.trim(),
        joinDate: form.joinDate,
        activeLoanCount: 0,
        totalLoansPaid: 0,
      },
    });
    setSubmitting(false);
    setDone(true);
  };

  const inputCls =
    "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-gray-100";

  const fields: { key: keyof typeof EMPTY; label: string; type?: string }[] = [
    { key: "membershipNo", label: "الرقم العضوي", type: "text" },
    { key: "fullName", label: "الاسم الكامل", type: "text" },
    { key: "nationalId", label: "الرقم الوطني", type: "text" },
    { key: "department", label: "المديرية/الدائرة", type: "text" },
    { key: "jobTitle", label: "المسمى الوظيفي", type: "text" },
    { key: "netSalary", label: "صافي الراتب (دينار)", type: "number" },
    { key: "phone", label: "رقم الهاتف", type: "text" },
  ];

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark p-6 font-tajawal">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl border border-line dark:border-gray-800 shadow-sm text-center max-w-md">
          <p className="text-lg font-bold text-primary dark:text-primary-soft mb-1">
            تم إنشاء ملفك بنجاح
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            أهلاً بك في منطقة الأعضاء. يمكنك الآن بدء الحسابات وتقديم الطلبات.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center p-4 font-tajawal">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl border border-line dark:border-gray-800 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-primary dark:text-primary-soft mb-1 text-center">
          أكمل ملفك العضوي
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">
          هذه المعلومات تُنشئ ملفك لدى الجمعية ويمكنك تعديلها لاحقاً.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {fields.map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={`signup-${key}`} className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
                {label}
              </label>
              <input
                id={`signup-${key}`}
                type={type ?? "text"}
                value={String(form[key])}
                onChange={(e) => set(key, e.target.value)}
                className={inputCls}
                dir={type === "number" ? "ltr" : undefined}
              />
              {errors[key] && (
                <span className="text-xs text-rose-600 dark:text-rose-400">هذا الحقل مطلوب</span>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-primary text-white py-3 rounded-lg font-bold text-base hover:bg-primary-hover transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {submitting ? "جارٍ الإنشاء..." : "إنشاء الملف"}
          </button>
        </form>
      </div>
    </div>
  );
}
