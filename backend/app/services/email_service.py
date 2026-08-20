import os
import requests

RESEND_API_URL = "https://api.resend.com/emails"


def send_otp_email(
    recipient_email: str,
    otp: str,
    purpose: str
):
    resend_api_key = os.getenv("RESEND_API_KEY")

    if not resend_api_key:
        raise RuntimeError(
            "RESEND_API_KEY is not configured on the server"
        )

    # =====================================================
    # SUBJECT + EMAIL CONTENT
    # =====================================================

    if purpose == "registration":

        subject = "Saath Groww - Registration OTP"

        message = f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
        ">

            <h2 style="color: #1DAB52;">
                Saath Groww Delivery
            </h2>

            <p>Hello,</p>

            <p>
                Thank you for registering with
                <strong>Saath Groww Delivery</strong>.
            </p>

            <p>
                Your registration OTP is:
            </p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1DAB52;
                margin: 20px 0;
            ">
                {otp}
            </div>

            <p>
                This OTP is valid for 5 minutes.
            </p>

            <p>
                If you did not request this registration,
                please ignore this email.
            </p>

            <br>

            <p>
                Regards,<br>
                <strong>Saath Groww Team</strong>
            </p>

        </div>
        """

    else:

        subject = "Saath Groww - Login OTP"

        message = f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
        ">

            <h2 style="color: #1DAB52;">
                Saath Groww Delivery
            </h2>

            <p>Hello,</p>

            <p>
                Your login OTP is:
            </p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1DAB52;
                margin: 20px 0;
            ">
                {otp}
            </div>

            <p>
                This OTP is valid for 5 minutes.
            </p>

            <br>

            <p>
                Regards,<br>
                <strong>Saath Groww Team</strong>
            </p>

        </div>
        """

    # =====================================================
    # FROM ADDRESS
    # =====================================================

    email_from = os.getenv(
        "EMAIL_FROM",
        "Saath Groww <onboarding@resend.dev>"
    )

    # =====================================================
    # DEBUG INFORMATION
    # =====================================================

    print("========================================")
    print("RESEND EMAIL REQUEST")
    print("========================================")
    print("Recipient:", recipient_email)
    print("Purpose:", purpose)
    print("From:", email_from)
    print(
        "API KEY CONFIGURED:",
        bool(resend_api_key)
    )

    if resend_api_key:
        print(
            "API KEY PREFIX:",
            resend_api_key[:6]
        )

    print("========================================")

    # =====================================================
    # RESEND REQUEST
    # =====================================================

    try:

        response = requests.post(
            RESEND_API_URL,

            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },

            json={
                "from": email_from,
                "to": [recipient_email],
                "subject": subject,
                "html": message
            },

            timeout=15
        )

    except requests.exceptions.Timeout:

        raise RuntimeError(
            "Resend API request timed out after 15 seconds."
        )

    except requests.exceptions.RequestException as error:

        raise RuntimeError(
            f"Could not connect to Resend API: {str(error)}"
        )

    # =====================================================
    # PRINT RESEND RESPONSE
    # =====================================================

    print("========================================")
    print("RESEND RESPONSE")
    print("========================================")
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
    print("========================================")

    # =====================================================
    # HANDLE ERROR
    # =====================================================

    if response.status_code >= 400:

        raise RuntimeError(
            f"RESEND_ERROR_STATUS={response.status_code}; "
            f"RESEND_ERROR_BODY={response.text}"
        )

    # =====================================================
    # SUCCESS
    # =====================================================

    try:
        response_data = response.json()
    except Exception:
        response_data = {}

    print(
        "OTP EMAIL SENT SUCCESSFULLY:",
        recipient_email
    )

    print(
        "RESEND EMAIL ID:",
        response_data.get("id")
    )

    return True