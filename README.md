# Different countries have different onboarding process: https://docs.stripe.com/connect/custom/onboarding#establish-requirements

# Charge Type

    -> Separate Charges and Transfers

# Required information for Connected Accounts

-> https://docs.stripe.com/connect/required-verification-information#IE+IE+none+full+individual+card_payments,transfers
-> https://docs.stripe.com/get-started/checklist/website
-> https://docs.stripe.com/connect/setting-mcc?connect-account-creation-pattern=typeless#mcc-manual
-> https://docs.stripe.com/api/accounts/update#update_account-individual-address-state

# Terms of conditions required.

- Policy about helding funds in account until account is crated.
- comminudate time frames for account setup and info required.
- Be transparent about when transfers will occur
- Keep good records of held funds
-
-
-

# Stripe rate limit

- Live mode: 100 read operations and 100 write operations
- Test mode: 25 read operations and 25 write operations

Reachout to stripe https://support.stripe.com to increase limit

# How to formate code ?

Run `npx prettier --write .` in project root.
->

# How to run it locally in dev env ?

You have to create .env file in root of this project, then set below parameters in file:-

```
AWS_ACCESS_KEY_ID="<access-key>"
AWS_SECRET_ACCESS_KEY="<secrete-value>"
AWS_SESSION_TOKEN="<token-value>"
AWS_REGION="us-east-1"
```

Now make sure you have aws creds for a user associated with 688567305352 account.

If you have local user assicaited with account, now you can assume developer-role-for-dev on local machine to connect to aws.

```
aws sts assume-role \
 --role-arn arn:aws:iam::688567305352:role/developer-role-for-dev \
 --role-session-name my-dev-session \
 --duration-seconds 43200
```

NOTE: above command will give you asscess only for 12 hours.

# Stripe payment Complete Flow:

Customer Journey:

-Customer enters amount on the payment form
-Views Stripe card element
-Enters card details
-Clicks Pay button

Frontend Processing:

-Validates input
-Makes API call to your backend to create PaymentIntent
-Receives clientSecret
-Uses Stripe.js to handle card validation
-Confirms payment with Stripe

Backend Processing:

-Receives amount from frontend
-Creates PaymentIntent with Stripe
-Returns clientSecret to frontend
-Listens for webhook events
-Processes successful payments

Success Handling:

-Payment confirmation page shown to customer
-Backend receives webhook
-Updates order status
-Sends confirmation email
-Updates database

Error Handling:

-Displays validation errors
-Shows card errors
-Handles failed payments
-Provides retry options
