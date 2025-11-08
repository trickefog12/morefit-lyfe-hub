# MoreFitLyfe - Admin Setup Guide

## 🎉 Welcome to Your New Website!

Your MoreFitLyfe website is ready! This guide will help you complete the final setup steps to go live.

## ✅ What's Already Done

- ✅ Beautiful, responsive design with mint & orange brand colors
- ✅ All pages created (Home, Programs, Meal Plans, Sign Up, Privacy, Terms)
- ✅ 7 products with Greek content and pricing
- ✅ Mobile-first responsive design
- ✅ SEO-optimized with meta tags
- ✅ Product catalog with detailed pages
- ✅ Newsletter signup forms

## 🚀 Required Setup Steps

### 1. Enable Lovable Cloud (Backend Features)

To enable payments, authentication, and email features:

1. Click the **"Connect Lovable Cloud"** button in the chat
2. This will set up your backend infrastructure automatically
3. You'll get a database, authentication, and serverless functions

### 2. Enable Stripe Integration

For payment processing:

1. Go to [Stripe](https://stripe.com) and create an account
2. In Lovable, click on the Stripe integration settings
3. Add your Stripe secret key when prompted
4. Test the payment flow in sandbox mode first

### 3. Email Configuration

To send transactional emails:

1. Sign up at [Resend.com](https://resend.com)
2. Verify your email domain: morefitlyfe.com
3. Create an API key at [https://resend.com/api-keys](https://resend.com/api-keys)
4. Add the `RESEND_API_KEY` to your Cloud secrets

**Important**: The system will send emails to morefitlyfe@gmail.com for:
- New signups
- Purchase notifications
- Contact form submissions

### 4. Analytics Setup

Add tracking for visitor insights:

1. **Google Analytics**: 
   - Create a GA4 property at [analytics.google.com](https://analytics.google.com)
   - Add the tracking ID to your site (in project settings)

2. **Facebook Pixel** (optional):
   - Create a pixel in Facebook Business Manager
   - Add the pixel ID to track conversions

### 5. Social Media Integration

Update your social profiles:
- Instagram: https://www.instagram.com/mariastefaniameraklis ✅ (already linked)
- TikTok: https://www.tiktok.com/@maria.meraklis ✅ (already linked)

### 6. Content Management

To update products, prices, or add new programs:

1. Edit the file: `src/data/products.ts`
2. Each product has:
   - SKU (unique identifier)
   - Name (Greek & English)
   - Price (in USD)
   - Description, deliverables, target audience
   - Category and format

### 7. Domain Setup

To connect your custom domain (morefitlyfe.com):

1. Go to Project > Settings > Domains in Lovable
2. Click "Connect Domain"
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (24-48 hours)

## 📝 Content That Needs Your Review

### Update These Sections:

1. **About Section** (Home page):
   - Currently has placeholder text about Stefania
   - Update with your actual bio, qualifications, and story
   
2. **Testimonials**:
   - Currently showing placeholder reviews
   - Replace with real client testimonials
   
3. **Product Images**:
   - AI-generated images are in place
   - Replace with actual photos of you, gym, clients (optional)

4. **Meal Plan Pricing**:
   - Current dynamic pricing is a placeholder
   - Adjust the pricing logic in `src/pages/MealPlans.tsx`

## 🎨 Design Customization

### Color Palette (already set):
- Primary (Mint): `hsl(160 84% 39%)`
- Secondary (Orange): `hsl(24 95% 53%)`
- You can adjust these in `src/index.css`

### Fonts:
- Currently using system fonts
- To add custom fonts (e.g., Poppins), update `index.html` and `tailwind.config.ts`

## 💳 Payment Flow

Current setup:
1. User clicks "Buy Now"
2. Stripe checkout opens (needs Stripe setup)
3. After payment:
   - Digital products → immediate download link
   - Custom programs → intake form → manual delivery
   - Coaching sessions → booking link/form

## 📧 Email Templates to Create

You'll need these email templates:

1. **Welcome Email** (new signups)
2. **Purchase Confirmation** (with download links)
3. **Intake Form Link** (for transformation program)
4. **Booking Confirmation** (for 1:1 coaching)

These can be set up in Resend or your email service.

## 🔒 GDPR & Legal

- ✅ Privacy Policy page created
- ✅ Terms of Service page created
- ✅ GDPR consent checkboxes on signup forms
- ⚠️ Review and customize the legal pages with your specific terms

## 📱 Testing Checklist

Before going live, test:

- [ ] All pages load correctly on mobile, tablet, desktop
- [ ] All navigation links work
- [ ] Product pages display correctly
- [ ] Signup forms submit properly
- [ ] Payment flow works (in test mode)
- [ ] Emails are delivered
- [ ] Links to Instagram/TikTok work
- [ ] Contact email (morefitlyfe@gmail.com) receives notifications

## 🚀 Going Live

1. Complete all setup steps above
2. Test thoroughly in staging
3. Switch Stripe to live mode
4. Connect your custom domain
5. Update social media with your new website link
6. Announce launch to your audience!

## 📞 Support

For technical issues or questions about Lovable:
- Lovable Docs: https://docs.lovable.dev/
- Lovable Discord: https://discord.gg/lovable

For website content or business questions:
- Contact: morefitlyfe@gmail.com

---

## 🎯 Quick Wins (Do These First)

1. ✅ Enable Lovable Cloud (5 min)
2. ✅ Enable Stripe (10 min)
3. ✅ Set up Resend email (10 min)
4. ✅ Update About section with real bio (15 min)
5. ✅ Add 2-3 real testimonials (10 min)
6. ✅ Test payment flow (15 min)

**Total time: ~1 hour to have a fully functional website!**

---

Good luck with your launch! 💪🏋️‍♀️
