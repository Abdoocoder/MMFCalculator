import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSettings } from './ProfileSettings';
import type { MemberProfile } from '../types';

const profile: MemberProfile = {
  id: 'mem_1',
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
  totalLoansPaid: 3,
};

describe('ProfileSettings', () => {
  it('submits the edited profile and shows a success banner', async () => {
    const onUpdateProfile = vi.fn();
    const user = userEvent.setup();
    render(<ProfileSettings profile={profile} onUpdateProfile={onUpdateProfile} />);

    const nameInput = screen.getByLabelText('اسم الموظف الثلاثي');
    await user.clear(nameInput);
    await user.type(nameInput, 'عمر خالد العبدالله');
    await user.click(screen.getByRole('button', { name: 'حفظ التغييرات' }));

    expect(onUpdateProfile).toHaveBeenCalledTimes(1);
    expect(onUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'عمر خالد العبدالله' })
    );
    expect(screen.getByText(/تم حفظ بياناتك وتحديث الصافي المالي بنجاح/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/تم حفظ بياناتك وتحديث الصافي المالي بنجاح/);
  });
});
