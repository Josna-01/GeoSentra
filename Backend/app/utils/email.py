import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.db import db
from app.config import settings

def create_email_token(email: str):
    token = secrets.token_urlsafe(32)
    db.collection("email_tokens").document(token).set({
        "email": email
    })
    return token


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send email using SMTP
    
    Configure SMTP settings in .env:
    - SMTP_SERVER (default: smtp.gmail.com)
    - SMTP_PORT (default: 587)
    - SMTP_USER
    - SMTP_PASSWORD
    
    Returns True if email sent successfully, False otherwise
    """
    try:
        # Get SMTP configuration from environment or use defaults
        smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = getattr(settings, 'SMTP_PORT', 587)
        smtp_user = getattr(settings, 'SMTP_USER', None)
        smtp_password = getattr(settings, 'SMTP_PASSWORD', None)
        
        # If SMTP not configured, log and return False (don't crash)
        if not smtp_user or not smtp_password:
            print(f"⚠️  Email not sent (SMTP not configured): {subject}")
            print(f"   To: {to_email}")
            print(f"   Configure SMTP_USER and SMTP_PASSWORD in .env to enable email")
            return False
        
        # Create message
        message = MIMEMultipart()
        message['From'] = smtp_user
        message['To'] = to_email
        message['Subject'] = subject
        
        # Add body
        message.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
        return False
