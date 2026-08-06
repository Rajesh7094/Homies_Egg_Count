import { mockStorage, ADMIN_EMAIL } from './mockStorage';

interface EmailPayload {
  batch_number: string;
  total_consumed: number;
  user_breakdown: Record<string, number>;
  admin_email: string;
}

export const sendEggFinishedEmail = async (payload: EmailPayload): Promise<{ success: boolean; message: string }> => {
  const { batch_number, total_consumed, user_breakdown, admin_email } = payload;

  // Build the specified subject and formatted body
  const subject = `Egg Stock Finished - ${batch_number}`;

  const breakdownLines = Object.entries(user_breakdown)
    .map(([name, count]) => `${name}\n${count} Eggs`)
    .join('\n\n');

  const body = `${total_consumed} Eggs Finished\n\nConsumption Summary\n\n${breakdownLines}\n\nTotal Consumed\n\n${total_consumed}\n\nPlease purchase new eggs.`;

  // Log in local mock storage for visual inspection in UI Activity / Admin Email Log
  mockStorage.logEmailNotification({
    batch_number,
    recipient: admin_email || ADMIN_EMAIL,
    subject,
    body,
    status: 'simulated',
  });

  mockStorage.logActivity(
    'System (Email Service)',
    'Triggered Automated Refill Email',
    `Sent "${subject}" to ${admin_email || ADMIN_EMAIL}`
  );

  // If a real Resend API Key is set in Vite environment variables
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Bachelor Egg Manager <notifications@resend.dev>',
          to: [admin_email || ADMIN_EMAIL],
          subject: subject,
          text: body,
        }),
      });

      if (!response.ok) {
        console.warn('Resend API returned error, logged locally instead.');
      } else {
        console.log('Resend API email sent successfully!');
      }
    } catch (err) {
      console.error('Error invoking Resend API:', err);
    }
  }

  return {
    success: true,
    message: `Automated email notification triggered for ${admin_email || ADMIN_EMAIL}`,
  };
};
