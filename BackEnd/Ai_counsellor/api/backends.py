import socket
import smtplib
from django.core.mail.backends.smtp import EmailBackend

class SMTP4(smtplib.SMTP):
    def _get_socket(self, host, port, timeout):
        # Force IPv4 by asking for AF_INET
        return socket.create_connection((host, port), timeout, source_address=None)

class CustomEmailBackend(EmailBackend):
    connection_class = SMTP4
