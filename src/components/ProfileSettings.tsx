import React, { useState } from 'react';
import { User, Building2, Phone, Award, Shield, Save, CheckCircle2, HelpCircle } from 'lucide-react';
import { MemberProfile } from '../types';

interface ProfileSettingsProps {
  profile: MemberProfile;
  onUpdateProfile: (updated: MemberProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<MemberProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-primary dark:text-primary-soft flex items-center gap-2">
            <User className="w-6 h-6" />
            <span>الملف الشخصي والبيانات الوظيفية</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            تحديث بيانات الموظف والصافي المالي لضمان صحة نتائج الحاسبة
          </p>
        </div>
        <div className="p-3 bg-primary/10 text-primary dark:text-primary-soft rounded-xl font-bold text-sm">
          عضوية # {profile.membershipNo}
        </div>
      </div>

      {savedSuccess && (
        <div role="status" className="p-4 bg-emerald-600 text-white font-medium rounded-xl shadow-md flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>تم حفظ بياناتك وتحديث الصافي المالي بنجاح!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        
        <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-3">
          البيانات الشخصية والمالية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label htmlFor="profile-full-name" className="text-xs font-bold text-gray-700 dark:text-gray-300">اسم الموظف الثلاثي</label>
            <input
              id="profile-full-name"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-national-id" className="text-xs font-bold text-gray-700 dark:text-gray-300">الرقم الوطني</label>
            <input
              id="profile-national-id"
              type="text"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-department" className="text-xs font-bold text-gray-700 dark:text-gray-300">المديرية / القسم</label>
            <input
              id="profile-department"
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-job-title" className="text-xs font-bold text-gray-700 dark:text-gray-300">المسمى الوظيفي</label>
            <input
              id="profile-job-title"
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-net-salary" className="text-xs font-bold text-gray-700 dark:text-gray-300">صافي الراتب الافتراضي (دينار)</label>
            <input
              id="profile-net-salary"
              type="number"
              dir="ltr"
              value={formData.netSalary}
              onChange={(e) => setFormData({ ...formData, netSalary: Number(e.target.value) })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-right text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-deductions" className="text-xs font-bold text-gray-700 dark:text-gray-300">الاقتطاعات الحالية (دينار)</label>
            <input
              id="profile-deductions"
              type="number"
              dir="ltr"
              value={formData.currentDeductions}
              onChange={(e) => setFormData({ ...formData, currentDeductions: Number(e.target.value) })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-right text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="profile-phone" className="text-xs font-bold text-gray-700 dark:text-gray-300">رقم الهاتف للتواصل</label>
            <input
              id="profile-phone"
              type="text"
              dir="ltr"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-right text-gray-900 dark:text-white"
            />
          </div>

        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التغييرات</span>
          </button>
        </div>

      </form>

      {/* Support & Contact Card */}
      <div className="bg-mist dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
        <h3 className="font-bold text-primary dark:text-primary-soft text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          <span>معلومات التواصل مع الدائرة المالية بالجمعية</span>
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          تقع مقر جمعية موظفي بلدية مادبا الكبرى في المبنى الرئيسي لبلدية مادبا. لاستلام نماذج الكفلاء ورزم المستندات، يرجى مراجعة أمين الصندوق خلال ساعات الدوام الرسمي من 8:00 صباحاً وحتى 2:00 ظهراً.
        </p>
      </div>

    </div>
  );
};
