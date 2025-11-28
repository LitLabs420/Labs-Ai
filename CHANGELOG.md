# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- [CRITICAL] Removed exposed API keys from localStorage (dashboard.js, stripe-config.js)
- [HIGH] Fixed XSS vulnerability in landing.html (innerHTML → textContent)
- [HIGH] Added error handling with timeouts to all async Stripe operations
- [MEDIUM] Enhanced webhook signature verification in Cloud Functions
- [MEDIUM] Added comprehensive input validation to payment handlers
- [MEDIUM] Implemented CORS/origin validation in security-utils.js
- [MEDIUM] Added data validation to Firestore writes with audit logging

### Added
- Comprehensive security fixes documentation (SECURITY_FIXES_APPLIED.md)
- Source control infrastructure (.gitignore, .gitattributes, GitHub Actions)
- Contributing guide (CONTRIBUTING.md)
- Changelog (this file)
- GitHub Actions CI/CD pipeline for automated deployment

### Changed
- Updated `.github/copilot-instructions.md` with architecture insights
- Enhanced error messages to prevent information leakage
- Strengthened session validation in payment flow

### Fixed
- Missing timeout handling in Stripe API calls
- Incomplete webhook event validation
- Missing bounds checking on payment amounts
- Inadequate user existence validation before Firestore updates

## [1.0.0] - 2024-11-28

### Initial Release
- Firebase authentication (email, Google OAuth)
- Dashboard with subscription management
- Stripe payment integration
- Chatbot widget
- Cloud Functions for webhook handling
- Real-time analytics
- Admin panel

### Known Limitations
- Admin credentials stored in frontend code (move to Secret Manager)
- Rate limiting not yet implemented
- Firestore security rules audit pending
- Email configuration requires manual setup
