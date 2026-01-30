import socket
import smtplib
from django.core.mail.backends.smtp import EmailBackend

class SMTP4(smtplib.SMTP):
    def _get_socket(self, host, port, timeout):
        # Force IPv4 by asking for AF_INET
        return socket.create_connection((host, port), timeout, source_address=None)

class SMTP_SSL4(smtplib.SMTP_SSL):
    def _get_socket(self, host, port, timeout):
        # Force IPv4 for SSL connections
        return socket.create_connection((host, port), timeout, source_address=None)

class CustomEmailBackend(EmailBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Use SMTP_SSL for port 465, regular SMTP for port 587
        if self.use_ssl:
            self.connection_class = SMTP_SSL4
        else:
            self.connection_class = SMTP4
