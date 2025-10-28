# Fake Job Application Form Setup Guide

This guide will help you set up the email functionality for the Fake Job Application form.

## Overview
The form uses two services:
1. **Formspree** - To receive application submissions at your email
2. **EmailJS** - To send automatic response emails to applicants

## Step 1: Set Up Formspree (Receive Applications)

### Detailed Formspree Setup:

1. **Sign Up**
   - Go to [https://formspree.io/](https://formspree.io/)
   - Click "Get Started" or "Sign Up"
   - Create account with your email (the email where you want to receive applications)
   - Verify your email address

2. **Create a New Form**
   - Once logged in, click the "+ New Form" button
   - Give your form a name: `Fake Job Application`
   - Click "Create Form"

3. **Get Your Form Endpoint**
   - After creating the form, you'll be taken to the form dashboard
   - Look for the "Integration" tab or "Endpoint" section
   - You'll see a URL that looks like: `https://formspree.io/f/xyzabc123`
   - Copy the part after `/f/` - this is your **FORM_ID** (example: `xyzabc123`)

4. **Configure Form Settings (Optional but Recommended)**
   - Go to the "Settings" tab
   - **Subject Line**: You can customize the email subject (already set to "New Fake Job Application Submission")
   - **Autoresponse**: TURN THIS OFF (we're using EmailJS for custom autoresponse)
   - **Uploads**: Make sure file uploads are enabled (should be on by default)
   - **reCAPTCHA**: Optional - add if you want spam protection

5. **Update Your Website Code**
   - Open `fakejob.html` in a code editor
   - Find line 470: `action="https://formspree.io/f/YOUR_FORM_ID"`
   - Replace `YOUR_FORM_ID` with your actual form ID
   - Example: `action="https://formspree.io/f/xyzabc123"`
   - Save the file

6. **Test Your Form**
   - Upload your website changes
   - Submit a test application
   - Check your email - you should receive the submission details
   - On Formspree dashboard, you can also see all submissions under "Submissions" tab

## Step 2: Set Up EmailJS (Send Auto-Response)

### Detailed EmailJS Setup:

1. **Sign Up**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Click "Sign Up" (top right)
   - Create a free account
   - Verify your email address

2. **Add Email Service**
   - Once logged in, click "Email Services" in the left sidebar
   - Click "Add New Service"
   - Choose your email provider (Gmail recommended, or Outlook, Yahoo, etc.)
   - Follow the prompts to connect your email account
   - After connecting, you'll see a **Service ID** (example: `service_abc123`) - **SAVE THIS!**

3. **Create Email Template**
   - Click "Email Templates" in the left sidebar
   - Click "Create New Template"
   - You'll see a template editor with fields:

   **Template Settings:**
   - **Template Name**: `job_application_autoresponse`

   **Email Template Fields:**
   - **To Email**: `{{to_email}}`
   - **From Name**: `Rithika` (or your name)
   - **From Email**: Your email address (should auto-fill)
   - **Subject**: `Thank you for your application`
   - **Content** (Message body):
     ```
     Hi {{to_name}},

     {{message}}
     ```

   - Click "Save" in the top right
   - After saving, note the **Template ID** (shown at top, looks like: `template_xyz789`) - **SAVE THIS!**

4. **Get Your Public Key**
   - Click "Account" in the left sidebar
   - Click on the "General" tab
   - Look for "Public Key" or "API Keys"
   - Copy your **Public Key** (looks like: `a1b2c3d4e5f6g7h8i9`) - **SAVE THIS!**

5. **Update Your Website Code**

   Open `fakejob.html` and replace three values:

   - **Line 648** - Find: `emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID'`
     - Replace `YOUR_SERVICE_ID` with your Service ID (example: `service_abc123`)
     - Replace `YOUR_TEMPLATE_ID` with your Template ID (example: `template_xyz789`)

   - **Line 660** - Find: `emailjs.init('YOUR_PUBLIC_KEY')`
     - Replace `YOUR_PUBLIC_KEY` with your Public Key

   Example of what it should look like after:
   ```javascript
   await emailjs.send('service_abc123', 'template_xyz789', autoresponseData);
   ```

   ```javascript
   emailjs.init('a1b2c3d4e5f6g7h8i9');
   ```

6. **Save and Test**
   - Save `fakejob.html`
   - Upload to your website
   - Submit a test application with your own email
   - You should receive the auto-response email with your custom message!

## Step 3: Test the Form

1. Open the Fake Job Application page
2. Fill out the form with test data
3. Submit the form
4. You should:
   - Receive an email with the application details at your email
   - The applicant should receive the auto-response email

## Troubleshooting

- **Not receiving submissions?** Check your Formspree form ID is correct and your account email is verified
- **Auto-response not working?** Check your EmailJS credentials and make sure the template uses the correct variable names
- **File uploads not working?** Make sure your Formspree plan supports file uploads (free plan has limits)

## Email Addresses

- **You receive at**: The email address you signed up with on Formspree
- **Applicant receives at**: The email they enter in the form

## Cost

- **Formspree Free**: 50 submissions/month
- **EmailJS Free**: 200 emails/month

Both should be more than enough for a personal project!
