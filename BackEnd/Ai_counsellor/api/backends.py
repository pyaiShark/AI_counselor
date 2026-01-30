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
    def open(self):
        """
        Override open() to use custom SMTP classes that force IPv4.
        """
        if self.connection:
            return False

        connection_params = {'timeout': self.timeout} if self.timeout else {}
        
        try:
            if self.use_ssl:
                # Use SSL connection (port 465)
                self.connection = SMTP_SSL4(
                    self.host, 
                    self.port, 
                    **connection_params
                )
            else:
                # Use TLS connection (port 587)
                self.connection = SMTP4(
                    self.host, 
                    self.port, 
                    **connection_params
                )
                if self.use_tls:
                    self.connection.starttls()
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except (smtplib.SMTPException, OSError):
            if not self.fail_silently:
                raise
