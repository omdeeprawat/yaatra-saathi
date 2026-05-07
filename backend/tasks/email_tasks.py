from celery import Task
from celery_app import celery_app
import resend
from jinja2 import Template
from core.config import settings
import logging

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


class EmailTask(Task):
    """Base task with retry logic"""
    autoretry_for = (Exception,)
    retry_kwargs = {"max_retries": 3}
    retry_backoff = True


@celery_app.task(base=EmailTask, name="tasks.send_otp_email")
def send_otp_email(email: str, name: str, otp: str):
    """Send OTP verification email"""
    if not settings.RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY is not configured")
    
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Arial', sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 40px auto; background: white; 
                         border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #E8650A 0%, #D97706 100%); 
                      padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .otp-box { background: #FEF3C7; border: 2px dashed #F59E0B; 
                       padding: 20px; text-align: center; border-radius: 8px; 
                       margin: 30px 0; }
            .otp { font-size: 36px; font-weight: bold; color: #E8650A; 
                   letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; padding: 20px; color: #6B7280; 
                      font-size: 14px; border-top: 1px solid #E5E7EB; }
            .mountain { color: #2D3A8C; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏔 Yatra Saathi</h1>
                <p style="color: white; margin: 10px 0 0 0;">
                    Your Pilgrimage Companion
                </p>
            </div>
            <div class="content">
                <h2>Namaste {{ name }}!</h2>
                <p>Thank you for registering with Yatra Saathi. To complete your 
                   registration, please verify your email address.</p>
                
                <p>Your One-Time Password (OTP) is:</p>
                
                <div class="otp-box">
                    <div class="otp">{{ otp }}</div>
                </div>
                
                <p><strong>This OTP is valid for 10 minutes.</strong></p>
                
                <p>If you didn't request this, please ignore this email.</p>
                
                <p class="mountain">Jai Nanda Devi 🙏</p>
            </div>
            <div class="footer">
                <p>Yatra Saathi © 2026 | Nanda Devi Raj Jat Yatra</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html_template)
    html_content = template.render(name=name, otp=otp)
    
    try:
        response = resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": email.strip(),
            "subject": "Verify Your Email - Yatra Saathi",
            "html": html_content,
        })
        logger.info(f"OTP email sent to {email}: {response}")
        return {"success": True, "id": response.get("id")}
    
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        raise


@celery_app.task(base=EmailTask, name="tasks.send_welcome_email")
def send_welcome_email(email: str, name: str):
    """Send welcome email after verification"""
    if not settings.RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY is not configured")
    
    html_content = f"""
    <h2>Welcome to Yatra Saathi, {name}! 🏔</h2>
    <p>Your email has been verified successfully.</p>
    <p>You can now access all features including:</p>
    <ul>
        <li>AI Yatra Guide for personalized answers</li>
        <li>Interactive 3D route map</li>
        <li>Sacred stories and historical accounts</li>
        <li>Community feed to connect with fellow pilgrims</li>
    </ul>
    <p>Jai Nanda Devi 🙏</p>
    """
    
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [email],
            "subject": "Welcome to Yatra Saathi!",
            "html": html_content,
        })
        logger.info(f"Welcome email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {str(e)}")