import { LoanRecord, MemberProfile } from '../types';

export const INITIAL_MEMBER_PROFILE: MemberProfile = {
  id: 'mem_12345',
  membershipNo: '12345',
  fullName: 'أحمد محمود الشوابكة',
  nationalId: '9851023456',
  department: 'مديرية الهندسة والمشاريع',
  jobTitle: 'رئيس قسم التخطيط العمراني',
  netSalary: 200,
  currentDeductions: 0,
  phone: '0791234567',
  joinDate: '2018-04-15',
  activeLoanCount: 1,
  totalLoansPaid: 3
};

export const INITIAL_LOAN_RECORDS: LoanRecord[] = [
  {
    id: 'rec_1001',
    referenceNo: 'MDB-2026-0842',
    date: '2026-08-01',
    productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    loanAmount: 500,
    netIncome: 200,
    durationYears: 1,
    monthlyInstallment: 48.16,
    totalWithInsurance: 577.88,
    status: 'approved',
    notes: 'تمت الموافقة على تمويل شراء الأجهزة الكهربائية بالمرابحة الإسلامية'
  },
  {
    id: 'rec_1002',
    referenceNo: 'MDB-2026-0911',
    date: '2026-08-05',
    productName: 'مرابحة الأثاث ومواد البناء والترميم',
    loanAmount: 1200,
    netIncome: 350,
    durationYears: 2,
    monthlyInstallment: 60.10,
    totalWithInsurance: 1442.40,
    status: 'pending',
    notes: 'قيد التدقيق لدى القسم المالي'
  }
];

export const ASSOCIATION_ANNOUNCEMENTS = [
  {
    id: 'ann_1',
    title: 'اعتماد المرابحة الإسلامية بنسبة ربح ثابتة 15%',
    content: 'وفق أحكام الشريعة الإسلامية، تمنح الجمعية تمويل شراء البضائع والسلع بالمرابحة بنسبة ربح ثابتة 15% سنوياً وبحد اقتطاع أقصى 40% من الراتب.',
    date: '2026-08-01',
    type: 'info'
  },
  {
    id: 'ann_2',
    title: 'استلام طلبات التمويل بالمرابحة لشهر آب',
    content: 'تعلن الهيئة الإدارية لجمعية موظفي بلدية مادبا الكبرى عن استقبال طلبات شراء البضائع والسلع بالمرابحة الإسلامية اعتباراً من 1 ولغاية 15 من هذا الشهر.',
    date: '2026-08-02',
    type: 'primary'
  }
];
