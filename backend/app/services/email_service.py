import os
import requests


RESEND_API_URL = "https://api.resend.com/emails"


def send_otp_email(
    recipient_email: str,
    otp: str,
    purpose: str
):
    """
    Send registration/login OTP using Resend.
    """

    # =====================================================
    # GET RESEND API KEY
    # =====================================================

    resend_api_key = os.getenv("RESEND_API_KEY")

    if not resend_api_key:
        raise RuntimeError(
            "RESEND_API_KEY is not configured on the server."
        )

    resend_api_key = resend_api_key.strip()

    # =====================================================
    # EMAIL FROM
    # =====================================================

    email_from = os.getenv(
        "EMAIL_FROM",
        "Saath Groww <onboarding@resend.dev>"
    ).strip()

    # =====================================================
    # SUBJECT + EMAIL CONTENT
    # =====================================================

    if purpose == "registration":

        subject = "Saath Groww - Registration OTP"

        message = f"""
        <!DOCTYPE html>
        <html>
        <body style="
            margin: 0;
            padding: 0;
            background-color: #f5f7f6;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 16px;
                padding: 35px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            ">

                <h2 style="
                    color: #1DAB52;
                    margin-bottom: 10px;
                ">
                    Saath Groww Delivery
                </h2>

                <p style="
                    color: #333333;
                    font-size: 16px;
                ">
                    Hello,
                </p>

                <p style="
                    color: #555555;
                    font-size: 15px;
                    line-height: 1.6;
                ">
                    Thank you for registering with
                    <strong>Saath Groww Delivery</strong>.
                </p>

                <p style="
                    color: #555555;
                    font-size: 15px;
                ">
                    Your registration OTP is:
                </p>

                <div style="
                    background-color: #f0faf4;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                    text-align: center;
                ">

                    <span style="
                        font-size: 34px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #1DAB52;
                    ">
                        {otp}
                    </span>

                </div>

                <p style="
                    color: #666666;
                    font-size: 14px;
                ">
                    This OTP is valid for <strong>5 minutes</strong>.
                </p>

                <p style="
                    color: #666666;
                    font-size: 14px;
                    line-height: 1.6;
                ">
                    If you did not request this registration,
                    please ignore this email.
                </p>

                <hr style="
                    border: none;
                    border-top: 1px solid #eeeeee;
                    margin: 30px 0;
                ">

                <p style="
                    color: #555555;
                    font-size: 14px;
                ">
                    Regards,<br>
                    <strong>Saath Groww Team</strong>
                </p>

            </div>

        </body>
        </html>
        """

    else:

        subject = "Saath Groww - Login OTP"

        message = f"""
        <!DOCTYPE html>
        <html>
        <body style="
            margin: 0;
            padding: 0;
            background-color: #f5f7f6;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 16px;
                padding: 35px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            ">

                <h2 style="
                    color: #1DAB52;
                    margin-bottom: 10px;
                ">
                    Saath Groww Delivery
                </h2>

                <p>Hello,</p>

                <p style="
                    color: #555555;
                    font-size: 15px;
                ">
                    Your login OTP is:
                </p>

                <div style="
                    background-color: #f0faf4;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                    text-align: center;
                ">

                    <span style="
                        font-size: 34px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #1DAB52;
                    ">
                        {otp}
                    </span>

                </div>

                <p style="
                    color: #666666;
                    font-size: 14px;
                ">
                    This OTP is valid for <strong>5 minutes</strong>.
                </p>

                <p style="
                    color: #666666;
                    font-size: 14px;
                ">
                    If you did not request this login,
                    please secure your account.
                </p>

                <hr style="
                    border: none;
                    border-top: 1px solid #eeeeee;
                    margin: 30px 0;
                ">

                <p style="
                    color: #555555;
                    font-size: 14px;
                ">
                    Regards,<br>
                    <strong>Saath Groww Team</strong>
                </p>

            </div>

        </body>
        </html>
        """

    # =====================================================
    # REQUEST PAYLOAD
    # =====================================================

    payload = {
        "from": email_from,
        "to": [recipient_email],
        "subject": subject,
        "html": message,
    }

    # =====================================================
    # DEBUG INFORMATION
    # =====================================================

    print("========================================")
    print("RESEND EMAIL REQUEST")
    print("========================================")
    print("FROM:", email_from)
    print("TO:", recipient_email)
    print("SUBJECT:", subject)
    print("API KEY CONFIGURED:", bool(resend_api_key))
    print("API KEY PREFIX:", resend_api_key[:3])
    print("========================================")

    # =====================================================
    # SEND EMAIL
    # =====================================================

    try:

        response = requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=15,
        )

    except requests.RequestException as error:

        print("========================================")
        print("RESEND NETWORK ERROR")
        print(error)
        print("========================================")

        raise RuntimeError(
            f"Could not connect to Resend: {error}"
        )

    # =====================================================
    # PRINT RESPONSE
    # =====================================================

    print("========================================")
    print("RESEND RESPONSE")
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
    print("========================================")

    # =====================================================
    # HANDLE ERROR
    # =====================================================

    if response.status_code >= 400:

        raise RuntimeError(
            f"Resend API error "
            f"{response.status_code}: "
            f"{response.text}"
        )

    # =====================================================
    # SUCCESS
    # =====================================================

    try:

        response_data = response.json()

    except ValueError:

        response_data = {
            "raw_response": response.text
        }

    print("OTP EMAIL SENT SUCCESSFULLY")
    print("Recipient:", recipient_email)
    print("Response:", response_data)

    return True