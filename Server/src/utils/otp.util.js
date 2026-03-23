import otpGenerator from 'otp-generator';

function generateOTP() {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
}

function getOtpHtml(otp) {
    return `<!DOCTYPE html>
    <html>
        <body>
            <h1>Your OTP Code</h1>
            <p>Your OTP code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
        </body>
    </html>
    `;
}

export { generateOTP, getOtpHtml };
