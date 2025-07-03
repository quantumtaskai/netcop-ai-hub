# Changelog

All notable changes to the NetCop AI Hub project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-07-03

### 🎯 MAJOR: Complete Wallet System Transformation

#### Added
- **Fresh Wallet System**: Direct AED currency instead of abstract credits
- **Database Schema**: New `wallet_balance` field and `wallet_transactions` table
- **Agent Pricing System**: Centralized pricing configuration in `agentPricing.ts`
- **WalletBalance Component**: Replaced CreditCounter with AED-based calculations
- **Transaction History**: Complete audit trail for wallet operations
- **Auto-Profile Creation**: Handles missing user profiles during signin/session restore
- **RLS Policies**: Comprehensive Row Level Security for wallet operations

#### Changed
- **Pricing Model**: From 15-45 credits to 2.00-8.00 AED direct pricing
- **User Interface**: All credit references replaced with wallet balance display
- **Payment Flow**: Stripe checkout for wallet top-ups instead of credit purchases
- **Agent Pages**: 6 agent pages updated to use wallet system
- **Authentication**: Enhanced signin with missing profile recovery
- **Database Structure**: Clean wallet-only schema (no legacy credit fields)

#### Removed
- **Credit System**: Completely removed abstract credit calculations
- **CreditCounter Component**: Replaced with WalletBalance
- **Credit Purchase Flow**: Replaced with wallet top-up system
- **Mixed UI References**: All fallback credit displays removed

#### Fixed
- **Signin Error**: Empty error object `{}` during signin with missing profiles
- **Registration RLS**: "new row violates row-level security policy" error
- **Component Dependencies**: All agents now use centralized pricing system
- **UI Consistency**: Removed "1,000 free credits" messaging from registration

#### Technical Details
- **Files Modified**: 13 files transformed, 3 new files created
- **Database**: Fresh schema with proper RLS policies
- **Components**: Complete transformation of credit → wallet logic
- **Agent Integration**: FAQ Generator, Social Ads Generator, Job Posting Generator updated

---

## [1.5.0] - 2025-07-02

### Added
- **CSS Architecture Optimization**: Centralized design system and style utilities
- **Design System**: Comprehensive tokens for colors, spacing, typography, gradients
- **Style Utilities**: Reusable patterns for glassmorphism, buttons, cards, animations
- **Responsive Design**: Clamp() functions for fluid scaling across devices
- **Component Consistency**: Shared styling patterns across all pages

### Changed
- **Code Reduction**: 30-40% reduction in CSS code duplication
- **Mobile-First**: Proper 44px touch targets and responsive behavior
- **Performance**: Optimized responsive scaling and better caching

---

## [1.4.0] - 2025-07-01

### Added
- **Header/Footer Consistency**: Shared components across all pages
- **Unified Navigation**: Consistent 80px logo and navigation patterns
- **Profile Management**: Enhanced user profile with dropdown positioning
- **Mobile Navigation**: Responsive menu with user profile integration

### Changed
- **Branding Update**: "NetCop AI Hub" → "Netcop Consultancy" throughout
- **Logo Standardization**: 80px height across all pages
- **Navigation Structure**: Sticky header with backdrop blur effects

---

## [1.3.0] - 2025-06-30

### Added
- **5 Whys Analysis Agent**: Advanced interactive chat-based root cause analysis
- **Professional Report Generation**: Local processing with structured sections
- **Multiple Export Options**: Copy, Markdown download, PDF generation
- **Enhanced UX**: Auto-focus input, session management, glassmorphism design

### Changed
- **Smart Credit System**: Free chat, credits only for final report generation
- **Interactive Interface**: Real-time conversation with AI methodology

---

## [1.2.0] - 2025-06-29

### Added
- **Stripe Payment System**: Complete integration with Payment Links
- **4 Credit Packages**: 10, 50, 100, 500 credits with AED pricing
- **Payment Flow**: Success/failure handling with webhook processing
- **Test Credit System**: Development environment credit management

### Changed
- **Currency**: AED pricing (9.99, 49.99, 99.99, 499.99 AED)
- **Payment Method**: Stripe Payment Links instead of Checkout Sessions

---

## [1.1.0] - 2025-06-28

### Added
- **Weather Reporter Agent**: OpenWeatherMap API integration
- **Data Analyzer Agent**: N8N webhook integration with file upload
- **Agent System Architecture**: Shared components and layouts
- **File Upload**: Drag & drop with type/size validation
- **Results Display**: Formatted output with copy/download options

### Changed
- **Agent Pages**: Individual pages instead of modal-based interaction
- **Component Structure**: Shared AgentLayout, ProcessingStatus, ResultsDisplay

---

## [1.0.0] - 2025-06-27

### Added
- **Initial Release**: NetCop AI Hub marketplace foundation
- **Authentication System**: Supabase Auth with user management
- **User Interface**: Homepage with agent cards and navigation
- **State Management**: Zustand for user sessions and data
- **Design System**: Glassmorphism aesthetic with gradient backgrounds

### Technical Foundation
- **Next.js 14**: App Router with TypeScript
- **Supabase**: Authentication and database
- **Zustand**: State management
- **Inline CSS**: Component-specific styling

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, complete system overhauls
- **Minor (1.X.0)**: New features, significant enhancements
- **Patch (1.1.X)**: Bug fixes, small improvements

## Contributing

When adding entries to this changelog:
1. Use the format: `### Added/Changed/Deprecated/Removed/Fixed/Security`
2. Include the date in YYYY-MM-DD format
3. Describe user-facing changes clearly
4. Reference technical details when relevant
5. Group related changes under appropriate headings