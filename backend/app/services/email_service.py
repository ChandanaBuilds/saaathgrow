import os
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def send_otp_email(
    recipient_email: str,
    otp: str,
    purpose: str
):

    sender_email = os.getenv("EMAIL_ADDRESS")
    sender_password = os.getenv("EMAIL_APP_PASSWORD")

    if not sender_email or not sender_password:
        raise RuntimeError(
            "Email environment variables are not configured"
        )

    if purpose == "registration":
        subject = "Saath Groww - Registration OTP"

        body = f"""
Hello,

Your Saath Groww registration OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
Saath Groww Team
"""

    else:
        subject = "Saath Groww - Login OTP"

        body = f"""
Hello,

Your Saath Groww login OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this login OTP, please secure your account.

Regards,
Saath Groww Team
"""

    message = MIMEMultipart()

    message["From"] = sender_email
    message["To"] = recipient_email
    message["Subject"] = subject

    message.attach(
        MIMEText(body, "plain")
    )

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT
    ) as server:

        server.starttls()

        server.login(
            sender_email,
            sender_password
        )

        server.sendmail(
            sender_email,
            recipient_email,
            message.as_string()
        )