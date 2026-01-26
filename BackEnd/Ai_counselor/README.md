## Creating an App Password for Your Google Account

If you have Two-Factor Authentication (2FA) enabled on your Google account, you will need to generate an App Password to allow third-party applications, like Django, to access your Gmail securely. Follow these steps:

### Step 1: Enable Two-Factor Authentication

1. **Go to Your Google Account**:
   - Open [Google Account settings](https://myaccount.google.com).
   
2. **Access the Security Tab**:
   - Select the **Security** option from the left-hand menu.
   
3. **Enable Two-Step Verification**:
   - Under the "Signing in to Google" section, click on **2-Step Verification**.
   - Follow the on-screen instructions to enable 2FA. You'll need to verify your phone number.

### Step 2: Create an App Password

1. **Return to the Security Section**:
   - Back in the **Security** tab, scroll to **Signing in to Google** and locate the **App passwords** option.

2. **Select App Passwords**:
   - Click on **App passwords**. You may need to re-enter your Google password for verification.
   
3. **Choose the App**:
   - In the "Select app" dropdown, choose **Other (Custom name)** and enter a descriptive name (e.g., "Django Email").

4. **Generate the Password**:
   - Click the **Generate** button. A new 16-character password will be displayed.

5. **Copy the Password**:
   - Copy the generated password. You will use this in your Django email settings.

### Step 3: Update Your Django Settings

1. **Replace the Password in Your Settings**:
   - In your Django application, navigate to your settings file and replace the existing email password with the generated App Password:

   ```python
   EMAIL_HOST_PASSWORD = 'your_generated_app_password'

## Google Login Integration

This section describes how to enable Google login in your Django application and retrieve user first and last names.

### Step 1: Obtain Google API Credentials

1. **Go to Google Developers Console**: Visit [Google Developers Console](https://console.developers.google.com/).
2. **Create a New Project**:
   - Click on the project dropdown and select **New Project**.
3. **Enable Google People API**:
   - Navigate to the **Library** section, search for **Google People API**, and enable it.
4. **Create OAuth Credentials**:
   - Go to the **Credentials** tab.
   - Click on **Create Credentials** and select **OAuth 2.0 Client IDs**.
   - Configure the consent screen if prompted.
   - Choose **Web application** as the application type.
   - Under **Authorized redirect URIs**, add the following (for local development):
     - `http://localhost:8000/accounts/google/login/callback/`
5. **Get Your Credentials**:
   - After creating the credentials, you will see your **Client ID** and **Client Secret**. Note these down.

### Step 2: Update Your Django Settings

1. **Add the Credentials to Your `.env` File**:
   - Open or create a `.env` file in the root of your Django project.
   - Add the following lines, replacing the placeholders with your actual credentials:
