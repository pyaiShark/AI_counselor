import socket
import smtplib
from django.core.mail.backends.smtp import EmailBackend

class SMTP4(smtplib.SMTP):
    def _get_socket(self, host, port, timeout):
        # Force IPv4 by asking for AF_INET
        return socket.create_connection((host, port), timeout, source_address=None)

class CustomEmailBackend(EmailBackend):
    def open(self):
        """
        Ensures we have a connection to the email server. Returns whether or not
        a new connection was created (or already existed).
        """
        if self.connection:
            # Nothing to do if the connection is already open.
            return False

        # If we need to connect, we simply override self.connection_class
        # temporarily or just manually instantiate our custom class.
        # But Django's EmailBackend uses self.connection_class which defaults to smtplib.SMTP.
        # We can just set it on the instance or class.
        
        # We will use our custom SMTP4 class that forces IPv4
        self.connection_class = SMTP4
        
        return super().open()
