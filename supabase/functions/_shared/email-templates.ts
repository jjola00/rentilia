// Email templates for Rentilia

export const emailTemplates = {
  bookingConfirmed: (data: {
    renterName: string;
    itemTitle: string;
    startDate: string;
    endDate: string;
    totalFee: number;
    pickupAddress: string;
  }) => ({
    subject: `Booking Confirmed: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Your Booking is Confirmed!</h2>
        <p>Hi ${data.renterName},</p>
        <p>Great news! Your booking has been confirmed and payment processed successfully.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.itemTitle}</h3>
          <p><strong>Rental Period:</strong><br>${data.startDate} - ${data.endDate}</p>
          <p><strong>Pickup Location:</strong><br>${data.pickupAddress}</p>
          <p><strong>Rental Fee:</strong> €${data.totalFee.toFixed(2)}</p>
        </div>
        
        <h3>What's Next?</h3>
        <ul>
          <li>The owner will confirm your booking</li>
          <li>You'll receive pickup instructions</li>
        </ul>
        
        <p>Questions? Reply to this email or contact the owner through the Rentilia app.</p>
        <p>Happy renting!<br>The Rentilia Team</p>
      </div>
    `,
  }),

  ownerNewBooking: (data: {
    ownerName: string;
    renterName: string;
    itemTitle: string;
    startDate: string;
    endDate: string;
    totalFee: number;
  }) => ({
    subject: `New Booking: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📦 New Booking Received!</h2>
        <p>Hi ${data.ownerName},</p>
        <p>You have a new confirmed booking for your item.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.itemTitle}</h3>
          <p><strong>Renter:</strong> ${data.renterName}</p>
          <p><strong>Rental Period:</strong><br>${data.startDate} - ${data.endDate}</p>
          <p><strong>Rental Fee:</strong> €${data.totalFee.toFixed(2)}</p>
        </div>
        
        <p>Please coordinate with the renter for pickup arrangements.</p>
        <p><a href="https://rentilia.com/dashboard/bookings" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a></p>
        
        <p>Best regards,<br>The Rentilia Team</p>
      </div>
    `,
  }),

  paymentFailed: (data: {
    renterName: string;
    itemTitle: string;
    errorMessage: string;
  }) => ({
    subject: `Payment Failed: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">❌ Payment Failed</h2>
        <p>Hi ${data.renterName},</p>
        <p>Unfortunately, your payment for <strong>${data.itemTitle}</strong> could not be processed.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Error:</strong> ${data.errorMessage}</p>
        </div>
        
        <p>Please try again with a different payment method or contact your bank if the issue persists.</p>
        <p><a href="https://rentilia.com/checkout" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Retry Payment</a></p>
        
        <p>Need help? Contact us at support@rentilia.com</p>
        <p>The Rentilia Team</p>
      </div>
    `,
  }),

  depositReleased: (data: {
    renterName: string;
    itemTitle: string;
  }) => ({
    subject: `Return Confirmed: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">✅ Return Confirmed!</h2>
        <p>Hi ${data.renterName},</p>
        <p>Great news! The owner has confirmed the return of your rental.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.itemTitle}</h3>
          <p style="color: #16a34a; font-weight: bold;">Status: Closed</p>
        </div>
        
        <p>Thank you for taking good care of the item!</p>
        <p>The Rentilia Team</p>
      </div>
    `,
  }),

  depositCaptured: (data: {
    renterName: string;
    itemTitle: string;
    capturedAmount: number;
    damageDescription: string;
  }) => ({
    subject: `Damage Reported: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">⚠️ Damage Reported</h2>
        <p>Hi ${data.renterName},</p>
        <p>The owner has reported damage to the rented item.</p>
        
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.itemTitle}</h3>
          <p><strong>Reported Damage:</strong> €${data.capturedAmount.toFixed(2)}</p>
          <p><strong>Reason:</strong><br>${data.damageDescription}</p>
        </div>
        
        <p>Our platform fee includes insurance coverage for eligible claims. We’ll follow up if we need more information.</p>
        <p>The Rentilia Team</p>
      </div>
    `,
  }),

  pickupConfirmed: (data: {
    renterName: string;
    itemTitle: string;
    returnDate: string;
  }) => ({
    subject: `Pickup Confirmed: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📦 Pickup Confirmed!</h2>
        <p>Hi ${data.renterName},</p>
        <p>The owner has confirmed that you've picked up <strong>${data.itemTitle}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Return By:</strong> ${data.returnDate}</p>
          <p>Please return the item on time and in good condition.</p>
        </div>
        
        <p>Enjoy your rental!</p>
        <p>The Rentilia Team</p>
      </div>
    `,
  }),

  returnConfirmed: (data: {
    ownerName: string;
    renterName: string;
    itemTitle: string;
  }) => ({
    subject: `Return Pending Confirmation: ${data.itemTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔄 Item Return Initiated</h2>
        <p>Hi ${data.ownerName},</p>
        <p>${data.renterName} has marked <strong>${data.itemTitle}</strong> as returned.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Action Required:</strong> Please inspect the item and confirm the return in your dashboard.</p>
        </div>
        
        <p><a href="https://rentilia.com/dashboard/bookings" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Return</a></p>
        
        <p>The Rentilia Team</p>
      </div>
    `,
  }),
};
