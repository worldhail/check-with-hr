export default (email, token) => {
    return {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Check with HR - Email Verification',
        text: 'Thank you for signing up with us.',
        html:`<p>
                <a href="http://localhost:20244/api/verify/user/complete?token=${token}">
                    Please verify your email address by clicking this link.
                </a>
              </p>`
    };
};