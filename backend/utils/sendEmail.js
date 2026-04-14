const nodemailer = require('nodemailer');

// Persistent transporter for Connection Pooling
let transporter;

/**
 * Initialize Transporter only once for production/staging to ensure pooling works.
 */
const getTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        console.log(`[SMTP] Initializing Production Pool: ${process.env.SMTP_HOST}`);
        
        const transportConfig = process.env.SMTP_HOST.includes('gmail') ? {
            service: 'gmail',
            pool: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: (process.env.SMTP_PASS || "").replace(/\s+/g, '')
            }
        } : {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT == 465, 
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5,
            connectionTimeout: 15000, 
            auth: {
                user: process.env.SMTP_USER,
                pass: (process.env.SMTP_PASS || "").replace(/\s+/g, '')
            }
        };

        transporter = nodemailer.createTransport(transportConfig);
    } else {
        console.log('[SMTP] Generating Ethereal testing account...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    try {
        await Promise.race([
            transporter.verify(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP Connection Timeout")), 12000))
        ]);
        console.log('[SMTP] Configuration Verified & Ready.');
    } catch (err) {
        console.error('[SMTP] Verification Failed or Timed Out:', err.message);
    }

    return transporter;
};

const sendEmail = async (options) => {
    try {
        const mailClient = await getTransporter();
        
        const fromAddress = `${process.env.FROM_NAME || 'KeeStore'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;
        console.log(`[SMTP] Attempting dispatch to ${options.email} via ${process.env.SMTP_HOST || 'Ethereal'} from ${fromAddress}`);
        
        const message = {
            from: fromAddress,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        // ⏱️ Execute sendMail with a hard 12s timeout
        const info = await Promise.race([
            mailClient.sendMail(message),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Email Dispatch Timeout")), 12000))
        ]);

        if (!process.env.SMTP_HOST) {
           console.log('--- Ethereal URL: %s ---', nodemailer.getTestMessageUrl(info));
        }
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[SMTP] Dispatch Failed:', error.message, error.code);
        throw new Error(`Email delivery failure: ${error.message}${error.code ? ' (' + error.code + ')' : ''}`);
    }
};

module.exports = sendEmail;
