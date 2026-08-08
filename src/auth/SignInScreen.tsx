import { useClerk } from "@clerk/clerk-react";

export default function SignInScreen() {
  const { openSignIn } = useClerk();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-canvas dark:bg-canvas-dark p-6 font-tajawal">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary dark:text-primary-soft mb-2">
          منطقة الأعضاء
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
          سجّل الدخول للوصول إلى الحاسبة الكاملة، سجلّاتك، وطلبات التمويل بالمرابحة.
        </p>
      </div>
      <button
        type="button"
        onClick={() => openSignIn()}
        className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-base hover:bg-primary-hover transition-all active:scale-95 cursor-pointer"
      >
        تسجيل الدخول
      </button>
      <a href="/" className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-primary transition-colors">
        العودة إلى الصفحة الرئيسية
      </a>
    </div>
  );
}
