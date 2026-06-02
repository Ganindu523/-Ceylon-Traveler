const nodemailer = require('nodemailer');

const sendBookingEmail = async (userEmail, tripData, usdToLkrRate) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const totalLKR = tripData.totalPriceLKR || 0;
    const totalUSD = (totalLKR / usdToLkrRate).toFixed(2);

    const htmlContent = `
        <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                <div style="background: #10b981; padding: 40px; text-align: center;">
                    <div style="background: rgba(255,255,255,0.2); width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-size: 32px;">🏝️</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">Booking Confirmed!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-weight: 500;">Your Sri Lankan adventure awaits.</p>
                </div>
                
                <div style="padding: 40px;">
                    <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Trip Itinerary</h2>
                    
                    ${tripData.destinations.map((dest, i) => `
                        <div style="margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-weight: 900; color: #10b981; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">LEG ${i+1}</p>
                            <p style="margin: 4px 0; font-weight: 800; font-size: 18px;">${dest.district}</p>
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600;">${dest.checkIn} — ${dest.checkOut} (${dest.nights} Nights)</p>
                        </div>
                    `).join('')}

                    <div style="margin-top: 40px; padding: 30px; background: #0f172a; border-radius: 24px; color: white;">
                        <p style="margin: 0; font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Total Investment</p>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px;">
                            <h3 style="margin: 0; font-size: 32px; font-weight: 900;">LKR ${totalLKR.toLocaleString()}</h3>
                            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #10b981;">≈ $${totalUSD}</p>
                        </div>
                    </div>

                    <div style="margin-top: 30px; text-align: center; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 16px;">
                        <span style="font-size: 20px; vertical-align: middle;">🛡️</span>
                        <span style="font-weight: 800; color: #475569; font-size: 14px; margin-left: 8px;">Premium Booking Protected</span>
                    </div>
                </div>

                <div style="background: #f1f5f9; padding: 24px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600;">Questions? Reply to this email or chat with your guide in the app.</p>
                </div>
            </div>
            <p style="text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 Ceylon Traveler | Premium Island Experiences</p>
        </div>
    `;

    const mailOptions = {
        from: `"Ceylon Traveler" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '🌴 Trip Confirmed: Your Ceylon Traveler Itinerary',
        html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingEmail };
