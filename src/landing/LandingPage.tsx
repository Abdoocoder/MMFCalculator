import { useRef, useState } from 'react';
import './landing.css';
import { StarField, StarSeal } from './StarField';
import LiveCalculator from './LiveCalculator';
import LedgerSection from './LedgerSection';
import { useReveal } from './useReveal';
import { LOAN_PRODUCTS } from '../utils/loanCalculator';
import { ASSOCIATION_ANNOUNCEMENTS } from '../data/mockData';
import { CalculationInput } from '../types';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const DEFAULT_INPUT: CalculationInput = {
  productId: 'appliances',
  loanAmount: 500,
  netIncome: 200,
  currentDeductions: 0,
  durationYears: 1,
};

const NAV_LINKS = [
  { href: '#products', label: 'المنتجات' },
  { href: '#ledger', label: 'دفتر التسوية' },
  { href: '#how', label: 'كيف تعمل' },
  { href: '#announcements', label: 'إعلانات الجمعية' },
];

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`landing-reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
  const [input, setInput] = useState<CalculationInput>(DEFAULT_INPUT);
  const calculatorRef = useRef<HTMLDivElement>(null);

  const selectProduct = (productId: string) => {
    const p = LOAN_PRODUCTS.find((x) => x.id === productId) ?? LOAN_PRODUCTS[0];
    setInput((prev) => ({
      ...prev,
      productId,
      durationYears: prev.durationYears > p.maxYears ? p.maxYears : prev.durationYears,
    }));
    calculatorRef.current?.scrollIntoView({
      behavior:
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      block: 'start',
    });
  };

  const certifiedStrip = [
    { label: 'ربح ثابت', value: '15%', note: 'وفق سياسة الجمعية' },
    { label: 'اقتطاع أقصى', value: '40%', note: 'من صافي الراتب' },
    { label: 'تأمين تقديري', value: '0.5%', note: 'سنوياً — تكلفة وليس رسوم' },
  ];

  return (
    <div className="landing-field min-h-screen font-tajawal text-[#eff1f3]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#062a4a]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5" aria-label="جمعية موظفي بلدية مادبا الكبرى">
            <StarSeal certified size={26} />
            <span className="text-[15px] font-bold leading-tight">
              جمعية موظفي بلدية مادبا الكبرى
            </span>
          </a>
          <nav className="hidden items-center gap-5 md:flex" aria-label="التنقل الرئيسي">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-[13.5px] text-[#cfe0f2] transition-colors hover:text-[#eff1f3]">
                {l.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={onLaunchApp}
            className="min-h-11 rounded-md bg-[#bcebe5] px-4 text-[13.5px] font-bold text-[#062a4a] transition-colors hover:bg-[#d9f6f2] focus-visible:outline-[#bcebe5]"
          >
            افتح الحاسبة
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden" aria-label="التنقل الرئيسي">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md px-3 text-[13px] text-[#cfe0f2] transition-colors hover:text-[#eff1f3]"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <StarField opacity={0.16} />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <RevealSection>
            <h1 className="text-[34px] font-extrabold leading-[1.15] text-[#eff1f3] sm:text-[44px] lg:text-[52px]">
              قسطك يُحتسب أمامك،
              <br />
              بنداً بنداً.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.9] text-[#cfe0f2]">
              نظام حاسبة المرابحة الإسلامية — جمعية موظفي بلدية مادبا الكبرى. اطّلع على التزامك كاملاً
              قبل أن تلتزم: الربح ثابت وفق سياسة الجمعية، والاقتطاع محدود بسقف نظامي، والتأمين تقدير
              تكلفة سنوي.
            </p>

            {/* Notation strip — the certified terms */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-white/15 py-4">
              {certifiedStrip.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5">
                  <StarSeal certified size={16} />
                  <div className="flex items-baseline gap-2">
                    <span className="landing-figures-sm font-semibold text-[#bcebe5]">{t.value}</span>
                    <span className="text-[13px] text-[#9db8d4]">{t.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onLaunchApp}
                className="rounded-md bg-[#bcebe5] px-6 py-3 text-[15px] font-bold text-[#062a4a] transition-colors hover:bg-[#d9f6f2] focus-visible:outline-[#bcebe5]"
              >
                احسب الآن واطّلع على الحاسبة
              </button>
              <a
                href="#how"
                className="rounded-md border border-white/25 px-6 py-3 text-[15px] font-semibold text-[#eff1f3] transition-colors hover:border-white/50"
              >
                كيف تُحتسب الأقساط
              </a>
            </div>
            <p className="mt-4 text-[13px] text-[#9db8d4]">
              الخدمة متاحة لأعضاء الجمعية فقط، وفق أحكام المرابحة الإسلامية.
            </p>
          </RevealSection>

          <div ref={calculatorRef}>
            <LiveCalculator input={input} onChange={setInput} onLaunchApp={onLaunchApp} />
          </div>
        </div>
      </section>

      {/* Key / legend — how to read the tiles */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <RevealSection>
            <h2 className="text-[24px] font-extrabold text-[#eff1f3] sm:text-[30px]">
              مفتاح الدفاتر: ماذا تعني كل نجمة؟
            </h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.9] text-[#cfe0f2]">
              النجمة في هذا النظام ليست زخرفة — هي ختم بندٍ أثبتته الحاسبة أمامك. كل نجمة مملوءة تعني
              أن هذا الشرط محسوب فعلياً في أرقامك، وفق الصيغ المعتمدة للجمعية.
            </p>
          </RevealSection>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: '15%',
                title: 'ربح ثابت',
                body: 'نسبة ربح ثابتة سنوياً وفق سياسة الجمعية، وليست معدلاً متغيراً.',
              },
              {
                value: '40%',
                title: 'سقف الاقتطاع',
                body: 'حدّ نظامي: لا يتجاوز اقتطاع القسط 40% من صافي الراتب الشهري.',
              },
              {
                value: '0.5%',
                title: 'تأمين تقديري',
                body: 'تقدير تكلفة سنوي يوضع في الحساب لكونه جزءاً من المنتج، وليس رسوم بنكية.',
              },
              {
                value: 'JOD',
                title: 'حساب فوري',
                body: 'تُحتسب الأقساط والإجمالي لحظياً من مدخلاتك، وتتساوى الدفاتر دائماً.',
              },
            ].map((item) => (
              <RevealSection key={item.title}>
                <div className="flex h-full flex-col gap-3 rounded-xl border border-white/15 bg-[#0a3a66]/50 p-5">
                  <div className="flex items-center justify-between">
                    <StarSeal certified size={22} />
                    <span className="landing-figures text-[22px] font-semibold text-[#bcebe5]">
                      {item.value}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#eff1f3]">{item.title}</h3>
                  <p className="text-[13px] leading-[1.8] text-[#9db8d4]">{item.body}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="relative overflow-hidden border-t border-white/10">
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <RevealSection>
            <h2 className="text-[24px] font-extrabold text-[#eff1f3] sm:text-[30px]">خطوط التمويل المتاحة</h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.9] text-[#cfe0f2]">
              خمسة خطوط مرابحة بمعدل ربح ثابت واحد وسقف اقتطاع واحد — اختر الخط لتحسبه في الحاسبة أعلاه.
            </p>
          </RevealSection>
          <div className="mt-8 overflow-hidden rounded-xl border border-white/15">
            {LOAN_PRODUCTS.map((p, i) => (
              <div
                key={p.id}
                className={`flex flex-col gap-3 bg-[#0a3a66]/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                  i > 0 ? 'border-t border-white/10' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <StarSeal size={18} />
                  <div>
                    <h3 className="text-[14.5px] font-bold text-[#eff1f3]">{p.name}</h3>
                    <p className="mt-0.5 text-[13px] text-[#9db8d4]">{p.description}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <div className="text-right">
                    <span className="landing-figures-sm text-[#bcebe5]">{p.maxYears}</span>
                    <span className="mr-1.5 text-[12px] text-[#9db8d4]">
                      {p.maxYears === 1 ? 'سنة' : 'سنوات'} كحد أقصى
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectProduct(p.id)}
                    className="min-h-11 rounded-md border border-[#bcebe5]/60 px-4 text-[13px] font-bold text-[#bcebe5] transition-colors hover:bg-[#bcebe5]/10"
                  >
                    احسب هذا المنتج
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative ledger */}
      <section id="ledger" className="relative overflow-hidden border-t border-white/10">
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <RevealSection>
            <h2 className="text-[24px] font-extrabold text-[#eff1f3] sm:text-[30px]">دفتر التسوية</h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.9] text-[#cfe0f2]">
              صفحة المساءلة الوحيدة التي تحتاجها: التزامك في المَدين، وسدادك في الدائن — ويتساوى
              الطرفان دائماً. غيّر أرقامك في الحاسبة أعلاه لتراه يتحدّث معك.
            </p>
          </RevealSection>
          <div className="mt-8 max-w-3xl">
            <LedgerSection input={input} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative overflow-hidden border-t border-white/10">
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <RevealSection>
            <h2 className="text-[24px] font-extrabold text-[#eff1f3] sm:text-[30px]">كيف تعمل</h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.9] text-[#cfe0f2]">
              ثلاث خطوات تتبع التسلسل الحقيقي للخدمة، من الحساب إلى الموافقة.
            </p>
          </RevealSection>
          <div className="mt-8 space-y-0">
            {[
              {
                n: '01',
                title: 'احسب التزامك',
                body: 'أدخل المبلغ وصافي الراتب والمدة، واطّلع على القسط الشهري والإجمالي ونسبة الالتزام لحظياً.',
              },
              {
                n: '02',
                title: 'قدّم طلبك',
                body: 'من الحاسبة الكاملة احفظ طلبك ليتولى القسم المالي تدقيقه وفق الأنظمة المعتمدة.',
              },
              {
                n: '03',
                title: 'تابع الحالة',
                body: 'تتبع طلبك من لوحة الطلبات حتى الموافقة، مع رقم مرجعي خاص بكل طلب.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex gap-5 border-b border-white/10 py-6 last:border-b-0"
              >
                <span className="landing-figures shrink-0 text-[26px] font-semibold leading-none text-[#bcebe5]">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#eff1f3]">{step.title}</h3>
                  <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[1.85] text-[#9db8d4]">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section id="announcements" className="relative overflow-hidden border-t border-white/10">
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <RevealSection>
            <h2 className="text-[24px] font-extrabold text-[#eff1f3] sm:text-[30px]">إعلانات الجمعية</h2>
          </RevealSection>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ASSOCIATION_ANNOUNCEMENTS.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/15 bg-[#0a3a66]/50 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <StarSeal certified size={16} />
                  <span className="landing-figures-sm text-[12px] text-[#9db8d4]">{a.date}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[#eff1f3]">{a.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.85] text-[#9db8d4]">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/10">
        <StarField opacity={0.12} />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <RevealSection>
            <h2 className="text-[26px] font-extrabold leading-snug text-[#eff1f3] sm:text-[34px]">
              أرقامك جاهزة تُحتسب الآن.
            </h2>
            <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-[1.9] text-[#cfe0f2]">
              افتح الحاسبة الكاملة لتحفظ طلبك، وتتبعه، وتطبع سند القسط — بذات الأرقام التي رأيتها
              أمامك.
            </p>
            <button
              type="button"
              onClick={onLaunchApp}
              className="mt-7 rounded-md bg-[#bcebe5] px-8 py-3.5 text-[16px] font-bold text-[#062a4a] transition-colors hover:bg-[#d9f6f2] focus-visible:outline-[#bcebe5]"
            >
              افتح الحاسبة الكاملة
            </button>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#041d33]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <StarSeal certified size={22} />
              <span className="text-[15px] font-bold text-[#eff1f3]">
                جمعية موظفي بلدية مادبا الكبرى
              </span>
            </div>
            <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.9] text-[#9db8d4]">
              نظام حاسبة المرابحة الإسلامية والخدمات الإلكترونية. الجمعية جمعية موظفين، وليست مؤسسة
              مالية؛ الخدمة متاحة لأعضائها وفق أحكام المرابحة الإسلامية وبنسبة ربح ثابتة وفق سياسة
              الجمعية.
            </p>
          </div>
          <div className="text-[13px] leading-[1.9] text-[#9db8d4] md:text-left">
            <p>
              تصميم وتطوير بواسطة{' '}
              <a
                href="https://www.abdoocoder.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#bcebe5] underline-offset-2 hover:underline"
              >
                Abdoo Coder
              </a>
            </p>
            <p className="mt-1 text-xs">الأرقام تقديرية وتخضع للتدقيق المالي النهائي.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
