from celery import Task
from celery_app import celery_app
import httpx
from core.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailTask(Task):
    """Base task with automatic retry."""

    autoretry_for = (Exception,)
    retry_kwargs = {"max_retries": 3}
    retry_backoff = True


def _send_emailjs_template(
    to_email: str,
    template_id: str,
    template_params: dict,
):
    """Send an email using an EmailJS template."""

    required_config = {
        "EMAILJS_SERVICE_ID": settings.EMAILJS_SERVICE_ID,
        "EMAILJS_PUBLIC_KEY": settings.EMAILJS_PUBLIC_KEY,
        "EMAILJS_API_URL": settings.EMAILJS_API_URL,
    }

    missing = [key for key, value in required_config.items() if not value]

    if not template_id:
        missing.append("EMAILJS template id")

    if missing:
        raise ValueError(
            f"Missing EmailJS configuration: {', '.join(missing)}"
        )

    payload = {
        "service_id": settings.EMAILJS_SERVICE_ID,
        "template_id": template_id,
        "user_id": settings.EMAILJS_PUBLIC_KEY,
        "template_params": {
            **template_params,
            "to_email": to_email.strip(),
        },
    }

    if settings.EMAILJS_PRIVATE_KEY:
        payload["accessToken"] = settings.EMAILJS_PRIVATE_KEY

    headers = {
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=20.0) as client:
        response = client.post(
            settings.EMAILJS_API_URL,
            json=payload,
            headers=headers,
        )

        response.raise_for_status()
        return response.text


@celery_app.task(base=EmailTask, name="tasks.send_otp_email")
def send_otp_email(email: str, name: str, otp: str):
    """Send OTP verification email."""

    if not settings.EMAILJS_OTP_TEMPLATE_ID:
        raise ValueError("EMAILJS_OTP_TEMPLATE_ID is not configured")

    try:
        response = _send_emailjs_template(
            to_email=email,
            template_id=settings.EMAILJS_OTP_TEMPLATE_ID,
            template_params={
                "subject": "Verify Your Email - Yatra Saathi",
                "to_name": name,
                "otp": otp,
                "from_name": settings.EMAILJS_FROM_NAME,
                "from_email": settings.EMAILJS_FROM_EMAIL,
            },
        )

        logger.info(f"OTP email sent to {email}")

        return {
            "success": True,
            "response": response,
        }

    except Exception as e:
        logger.exception(f"Failed to send OTP email to {email}")
        raise e


@celery_app.task(base=EmailTask, name="tasks.send_welcome_email")
def send_welcome_email(email: str, name: str):
    """Send welcome email."""

    if not settings.EMAILJS_WELCOME_TEMPLATE_ID:
        raise ValueError("EMAILJS_WELCOME_TEMPLATE_ID is not configured")

    try:
        response = _send_emailjs_template(
            to_email=email,
            template_id=settings.EMAILJS_WELCOME_TEMPLATE_ID,
            template_params={
                "subject": "Welcome to Yatra Saathi!",
                "to_name": name,
                "from_name": settings.EMAILJS_FROM_NAME,
                "from_email": settings.EMAILJS_FROM_EMAIL,
            },
        )

        logger.info(f"Welcome email sent to {email}")

        return {
            "success": True,
            "response": response,
        }

    except Exception as e:
        logger.exception(f"Failed to send welcome email to {email}")
        raise e