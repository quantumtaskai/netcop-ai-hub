'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { useRouter } from 'next/navigation';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const router = useRouter();
  const { user, signOut, refreshUser } = useUserStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // All JavaScript functionality from original HTML
  useEffect(() => {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
      const handleToggle = () => {
        navMenu.classList.toggle('active');
      };

      navToggle.addEventListener('click', handleToggle);

      // Close mobile menu when clicking on a link
      document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
        });
      });

      return () => navToggle.removeEventListener('click', handleToggle);
    }
  }, []);

  // Smooth scrolling for navigation links
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href')!);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }, []);

  // Header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          (header as HTMLElement).style.background = 'rgba(255, 255, 255, 0.98)';
          (header as HTMLElement).style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
          (header as HTMLElement).style.background = 'rgba(255, 255, 255, 0.95)';
          (header as HTMLElement).style.boxShadow = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate elements on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Enhanced scroll animations with stagger effect
  useEffect(() => {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, index * 100);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Apply stagger effect to service cards and client cards
    document.querySelectorAll('.service-card, .client-card').forEach(el => {
      staggerObserver.observe(el);
    });

    return () => staggerObserver.disconnect();
  }, []);

  // Add loading animation for better UX
  useEffect(() => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-in-out';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
  }, []);

  // Add hover effects for service cards
  useEffect(() => {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mouseenter', function(this: HTMLElement) {
        this.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', function(this: HTMLElement) {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }, []);

  // Add parallax effect to hero section
  useEffect(() => {
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      const rate = scrolled * -0.5;
      
      if (hero) {
        (hero as HTMLElement).style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleParallax);
    return () => window.removeEventListener('scroll', handleParallax);
  }, []);

  // Add typewriter effect to hero title
  useEffect(() => {
    const typeWriter = (element: HTMLElement, text: string, speed = 100) => {
      let i = 0;
      element.innerHTML = '';
      
      function type() {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      }
      type();
    };

    // Initialize typewriter effect when page loads
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
      const originalText = heroTitle.textContent || '';
      setTimeout(() => {
        typeWriter(heroTitle as HTMLElement, originalText, 50);
      }, 500);
    }
  }, []);

  // Add progressive loading for images
  useEffect(() => {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', function(this: HTMLImageElement) {
        this.style.opacity = '0';
        this.style.transition = 'opacity 0.3s ease-in-out';
        setTimeout(() => {
          this.style.opacity = '1';
        }, 100);
      });
    });
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data
    const data = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      message: formData.message
    };
    
    // Here you can add your form submission logic
    // For now, we'll show a success message
    alert('Thank you for your message! We will get back to you within 24 hours.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Privacy Policy Modal Functions
  const openPrivacyModal = () => {
    setIsPrivacyModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    if (!isPrivacyModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePrivacyModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isPrivacyModalOpen]);

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary-gradient: linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%);
          --secondary-gradient: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%);
          --dark-blue: #1E40AF;
          --light-blue: #40E0D0;
          --text-dark: #1f2937;
          --text-light: #6b7280;
          --text-white: #ffffff;
          --bg-light: #f8fafc;
          --white: #ffffff;
          --shadow-light: 0 4px 6px rgba(0, 0, 0, 0.07);
          --shadow-medium: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: var(--text-dark);
          overflow-x: hidden;
        }

        /* Header & Navigation */
        .header {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: var(--dark-blue);
        }

        .logo-text {
          font-size: 1.8rem;
          font-weight: 700;
          margin-left: 0.5rem;
        }

        .logo-tagline {
          font-size: 0.8rem;
          color: var(--light-blue);
          font-weight: 400;
          margin-left: 0.5rem;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          gap: 2rem;
        }

        .nav-menu a {
          text-decoration: none;
          color: var(--text-dark);
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-menu a:hover {
          color: var(--dark-blue);
        }

        .nav-toggle {
          display: none;
          flex-direction: column;
          cursor: pointer;
        }

        .nav-toggle span {
          width: 25px;
          height: 3px;
          background: var(--text-dark);
          margin: 3px 0;
          transition: 0.3s;
        }

        /* Hero Section */
        .hero {
          background: var(--primary-gradient);
          color: var(--text-white);
          padding: 8rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-content h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-tagline {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
        }

        .hero-description {
          font-size: 1.2rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-image img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: var(--shadow-medium);
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-block;
        }

        .btn-primary {
          background: var(--white);
          color: var(--dark-blue);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }

        .btn-secondary {
          background: transparent;
          color: var(--white);
          border: 2px solid var(--white);
        }

        .btn-secondary:hover {
          background: var(--white);
          color: var(--dark-blue);
        }

        /* Company Profile Section */
        .company-profile {
          padding: 6rem 2rem;
          background: var(--white);
        }

        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .profile-image {
          position: relative;
        }

        .profile-image img {
          width: 100%;
          border-radius: 12px;
          box-shadow: var(--shadow-light);
        }

        .profile-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--dark-blue);
          margin-bottom: 1.5rem;
        }

        .profile-text {
          font-size: 1.1rem;
          color: var(--text-light);
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        /* Founder Section */
        .founder-section {
          padding: 6rem 2rem;
          background: var(--primary-gradient);
          color: var(--text-white);
        }

        .founder-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .founder-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 3rem;
        }

        .founder-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 3rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .founder-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--dark-blue);
        }

        .founder-name {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .founder-bio {
          font-size: 1.1rem;
          line-height: 1.6;
          opacity: 0.9;
        }

        .social-icons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background: var(--white);
          color: var(--dark-blue);
          transform: translateY(-2px);
        }

        /* Client Roster Section */
        .client-roster {
          padding: 6rem 2rem;
          background: var(--bg-light);
        }

        .client-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--dark-blue);
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.2rem;
          color: var(--text-light);
          max-width: 600px;
          margin: 0 auto;
        }

        .client-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .client-card {
          background: var(--white);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-light);
          text-align: center;
          transition: all 0.3s ease;
        }

        .client-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-medium);
        }

        .client-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--dark-blue);
          margin-bottom: 0.5rem;
        }

        .client-card p {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        /* Services Section */
        .services {
          padding: 6rem 2rem;
          background: var(--white);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .service-card {
          background: var(--bg-light);
          padding: 2.5rem;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(64, 224, 208, 0.2);
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-medium);
          background: var(--white);
        }

        .service-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-gradient);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: var(--white);
        }

        .service-card h3 {
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--dark-blue);
          margin-bottom: 1rem;
        }

        .service-card p {
          color: var(--text-light);
          line-height: 1.6;
        }

        /* Commitment Section */
        .commitment {
          padding: 6rem 2rem;
          background: var(--primary-gradient);
          color: var(--text-white);
          text-align: center;
        }

        .commitment-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .commitment h2 {
          font-size: 2.8rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 2rem;
        }

        /* Contact Section */
        .contact {
          padding: 6rem 2rem;
          background: var(--bg-light);
        }

        .contact-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-top: 3rem;
        }

        .contact-form {
          background: var(--white);
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-light);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-dark);
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--light-blue);
        }

        .contact-info {
          background: var(--white);
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-light);
        }

        .contact-info h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--dark-blue);
          margin-bottom: 2rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .contact-icon {
          width: 50px;
          height: 50px;
          background: var(--primary-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          color: var(--white);
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .contact-details h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--dark-blue);
          margin-bottom: 0.5rem;
        }

        .contact-details p {
          color: var(--text-light);
          line-height: 1.4;
        }

        /* Footer */
        .footer {
          background: var(--text-dark);
          color: var(--text-white);
          padding: 3rem 2rem 1rem;
          text-align: center;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          margin-bottom: 2rem;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 1rem;
          color: #9ca3af;
        }

        /* Enhanced Responsive Design */
        @media (max-width: 768px) {
          .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: var(--white);
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: var(--shadow-light);
            padding: 2rem 0;
          }

          .nav-menu.active {
            left: 0;
          }

          .nav-toggle {
            display: flex;
          }

          /* Two-column grids become single column */
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }

          /* Company Profile responsive */
          div[style*="grid-template-columns: 1fr 1fr"][style*="gap: 60px"] {
            gap: 40px !important;
          }

          /* Founder section responsive - swap order */
          div[style*="order: 2"] {
            order: 1 !important;
          }

          div[style*="order: 1"] {
            order: 2 !important;
          }

          /* Contact form responsive */
          div[style*="grid-template-columns: 1fr 1fr"][style*="alignItems: start"] {
            gap: 40px !important;
          }

          /* Hero responsive */
          h1[style*="clamp(48px, 8vw, 80px)"] {
            font-size: clamp(36px, 8vw, 64px) !important;
          }

          /* Services grid responsive */
          div[style*="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          /* Client grid responsive */
          div[style*="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          /* Navigation improvements */
          nav div[style*="gap: 40px"] {
            display: none !important;
          }

          nav div[style*="gap: 32px"] {
            display: none !important;
          }
        }

        /* Tablet responsive */
        @media (max-width: 1024px) and (min-width: 769px) {
          div[style*="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          div[style*="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Service cards hover animation */
        @media (hover: hover) {
          div[style*="background: white"][style*="borderRadius: 20px"]:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 16px 48px rgba(30, 64, 175, 0.12) !important;
          }
        }

        /* Form input focus styles */
        input:focus, textarea:focus {
          border-color: #40E0D0 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(64, 224, 208, 0.1) !important;
        }

        /* Button hover improvements */
        button:hover {
          transform: translateY(-2px) !important;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }

        .animate-on-scroll.animated {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div>
        {/* Shared Header */}
        <Header currentPage="home" />
        
        {/* Old header replaced with shared component */}
        <nav style={{ display: 'none' }} old-header={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '20px 24px',
          backdropFilter: 'blur(30px)',
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <Link href="/" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease',
                  padding: '8px',
                  borderRadius: '12px'
                }}>
                <img 
                  src="/logo.png" 
                  alt="Netcop AI Hub Logo"
                  style={{
                    height: '80px',
                    width: 'auto'
                  }}
                />
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'none'
                }}>
                  Netcop AI Hub
                </div>
              </Link>
              <div style={{ display: 'flex', gap: '32px' }}>
                <span style={{ color: '#6366f1', fontWeight: '600' }}>Home</span>
                <Link href="/marketplace" style={{ color: '#9ca3af', fontWeight: '500', textDecoration: 'none' }}>AI Marketplace</Link>
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>Agents</span>
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>Categories</span>
                <span 
                  onClick={() => router.push('/pricing')}
                  style={{ 
                    color: '#9ca3af', 
                    fontWeight: '500', 
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#6366f1'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#9ca3af'}
                >
                  Pricing
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {user ? (
                <>
                  <div 
                    onClick={() => router.push('/pricing')}
                    style={{
                      background: user.credits <= 100 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : user.credits <= 500
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: user.credits <= 100 
                        ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                        : user.credits <= 500
                        ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                        : '0 4px 15px rgba(16, 185, 129, 0.3)',
                      animation: user.credits <= 100 ? 'pulse 2s infinite' : 'none',
                      minWidth: '140px',
                      textAlign: 'center'
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.transform = 'translateY(-1px) scale(1.02)';
                      (e.target as HTMLElement).style.boxShadow = user.credits <= 100 
                        ? '0 6px 20px rgba(239, 68, 68, 0.4)'
                        : user.credits <= 500
                        ? '0 6px 20px rgba(245, 158, 11, 0.4)'
                        : '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)';
                      (e.target as HTMLElement).style.boxShadow = user.credits <= 100 
                        ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                        : user.credits <= 500
                        ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                        : '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      <span>
                        {user.credits <= 100 ? '⚠️' : user.credits <= 500 ? '⚡' : '✨'}
                      </span>
                      <span>{user.credits.toLocaleString()} Credits</span>
                      <span style={{
                        fontSize: '22px',
                        fontWeight: '900',
                        marginLeft: '4px',
                        opacity: '0.8'
                      }}>
                        +
                      </span>
                    </div>
                  </div>
                  <div 
                    onClick={e => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right
                      });
                      setShowProfileModal(true);
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      background: showProfileModal ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      if (!showProfileModal) {
                        (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
                        (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!showProfileModal) {
                        (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
                        (e.target as HTMLElement).style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>{user.name}</span>
                    <span style={{ 
                      color: '#6b7280', 
                      fontSize: '14px',
                      marginLeft: '4px'
                    }}>
                      ↓
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6b7280',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '9999px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Enhanced Hero Section with Light Background */}
        <section style={{ 
          position: 'relative', 
          padding: '80px 24px 100px', 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #f1f5f9 70%, #f8fafc 100%)',
          overflow: 'hidden',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Subtle Background Elements */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
            {/* Floating Elements with Better Positioning */}
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '10%',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.05) 100%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
              filter: 'blur(1px)'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '120px',
              right: '15%',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: '2s',
              filter: 'blur(1px)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '120px',
              left: '30%',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 100%)',
              borderRadius: '50%',
              animation: 'float 7s ease-in-out infinite',
              animationDelay: '4s',
              filter: 'blur(1px)'
            }}></div>

            {/* Trust Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.08)',
              padding: '8px 20px',
              borderRadius: '50px',
              marginBottom: '40px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '12px' }}>✨</span>
              <span>Trusted by Industry Leaders</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(56px, 9vw, 110px)',
              fontWeight: 800,
              marginBottom: '40px',
              lineHeight: '1.05',
              letterSpacing: '-0.02em'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 40%, #6366f1 80%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 6s ease-in-out infinite'
              }}>
                AI & Cybersecurity
              </span>
              <br />
              <span style={{ 
                color: '#1e293b',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
              }}>
                Solutions
              </span>
            </h1>

            <p style={{
              fontSize: '1.4rem',
              color: '#475569',
              marginBottom: '56px',
              maxWidth: '720px',
              margin: '0 auto 56px auto',
              lineHeight: '1.7',
              fontWeight: 400
            }}>
              Secure your digital future with state-of-the-art AI solutions and expert cybersecurity strategies tailored for your business needs.
            </p>

            {/* Enhanced CTA Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '80px'
            }}>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: 'white',
                  padding: '18px 36px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)'
                  ;(e.target as HTMLElement).style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.35), 0 6px 16px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
                  ;(e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                Get Protected Now
              </button>
              <Link href="/marketplace" style={{
                background: 'white',
                color: '#3b82f6',
                padding: '18px 36px',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '1.1rem',
                border: '2px solid #e2e8f0',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(59, 130, 246, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-block',
                letterSpacing: '0.01em'
              }}>
                Explore AI Hub
              </Link>
            </div>

            {/* Enhanced Trust Indicators */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '48px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ 
                textAlign: 'center',
                padding: '24px 16px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  marginBottom: '8px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  18+
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#64748b',
                  fontWeight: '500',
                  letterSpacing: '0.01em'
                }}>
                  Years Experience
                </div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '24px 16px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  marginBottom: '8px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  24/7
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#64748b',
                  fontWeight: '500',
                  letterSpacing: '0.01em'
                }}>
                  Rapid Response
                </div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '24px 16px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  marginBottom: '8px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  100%
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#64748b',
                  fontWeight: '500',
                  letterSpacing: '0.01em'
                }}>
                  Secure Solutions
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Company Profile Section */}
        <section style={{ 
          padding: '120px 24px', 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decorative elements */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '200px',
            height: '200px',
            background: 'rgba(30, 64, 175, 0.03)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '150px',
            height: '150px',
            background: 'rgba(64, 224, 208, 0.05)',
            borderRadius: '50%',
            filter: 'blur(30px)'
          }}></div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(30, 64, 175, 0.1)',
                padding: '8px 20px',
                borderRadius: '50px',
                marginBottom: '24px',
                border: '1px solid rgba(30, 64, 175, 0.2)'
              }}>
                <span style={{ fontSize: '16px' }}>🏢</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF' }}>About Netcop Consultancy</span>
              </div>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                fontWeight: 800, 
                color: '#1E40AF', 
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Your Trusted Digital Guardian
              </h2>
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#6b7280', 
                maxWidth: '600px', 
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Pioneering the future of cybersecurity with AI-powered solutions
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
              {/* Content Side */}
              <div>
                <div style={{
                  background: 'white',
                  padding: '48px',
                  borderRadius: '24px',
                  boxShadow: '0 20px 60px rgba(30, 64, 175, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  position: 'relative'
                }}>
                  {/* Decorative corner */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%)',
                    borderTopRightRadius: '24px',
                    borderBottomLeftRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    🛡️
                  </div>

                  <h3 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 700, 
                    color: '#1E40AF', 
                    marginBottom: '24px',
                    marginTop: '20px'
                  }}>
                    Defending Digital Frontiers
                  </h3>
                  
                  <p style={{ 
                    color: '#4b5563', 
                    fontSize: '1.1rem', 
                    lineHeight: '1.8', 
                    marginBottom: '32px' 
                  }}>
                    At Netcop Consultancy, we provide <strong>state-of-the-art AI & Cybersecurity solutions</strong> tailored to safeguard your business. From advanced AI Agents to robust defense strategies, we empower you to navigate the digital world with confidence.
                  </p>

                  {/* Enhanced badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%)', 
                      color: 'white', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      textAlign: 'center',
                      boxShadow: '0 4px 16px rgba(64, 224, 208, 0.3)'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                      18+ Years Experience
                    </div>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: 'white', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      textAlign: 'center',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                      Top Certifications
                    </div>
                  </div>

                  <div style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    color: 'white', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚫</div>
                    Lean Six Sigma Black Belt
                  </div>
                </div>
              </div>

              {/* Visual Side */}
              <div style={{ position: 'relative' }}>
                {/* Main visual container */}
                <div style={{ 
                  width: '100%', 
                  maxWidth: '500px',
                  height: '400px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  borderRadius: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                  boxShadow: '0 32px 80px rgba(30, 64, 175, 0.2)',
                  position: 'relative',
                  margin: '0 auto',
                  overflow: 'hidden'
                }}>
                  {/* Animated background pattern */}
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    animation: 'float 6s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '20%',
                    width: '40px',
                    height: '40px',
                    background: 'rgba(64, 224, 208, 0.3)',
                    borderRadius: '50%',
                    animation: 'float 4s ease-in-out infinite',
                    animationDelay: '2s'
                  }}></div>
                  
                  {/* Main icon */}
                  <div style={{ 
                    color: 'white', 
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    zIndex: 1,
                    position: 'relative'
                  }}>
                    🛡️
                  </div>
                </div>

                {/* Floating elements around the main visual */}
                <div style={{
                  position: 'absolute',
                  top: '10%',
                  right: '-10%',
                  width: '80px',
                  height: '80px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(30, 64, 175, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  animation: 'float 5s ease-in-out infinite'
                }}>
                  🔒
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '-5%',
                  width: '60px',
                  height: '60px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 8px 32px rgba(64, 224, 208, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  animation: 'float 7s ease-in-out infinite',
                  animationDelay: '1s'
                }}>
                  🤖
                </div>
              </div>
            </div>

            {/* Bottom achievement strip */}
            <div style={{
              marginTop: '80px',
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 16px 48px rgba(30, 64, 175, 0.08)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E40AF' }}>Mission Critical</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Zero Compromise</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E40AF' }}>Rapid Response</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>24/7 Protection</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔬</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E40AF' }}>Innovation</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Cutting Edge Tech</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤝</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E40AF' }}>Trusted Partner</div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Industry Leaders</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section - Modern Cards */}
        <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '16px', color: '#1E40AF' }}>
              Our Services
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.2rem', marginBottom: '48px' }}>
              Tailored strategies for your business
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E40AF', marginBottom: '16px' }}>Cybersecurity Consultation</h3>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Tailored strategies, advanced threat detection, and comprehensive security frameworks to protect your digital assets and business operations.
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤖</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E40AF', marginBottom: '16px' }}>AI Based Automation</h3>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Empower your Business with AI. Strategic AI adoption, machine learning solutions, and intelligent automation to transform your processes.
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E40AF', marginBottom: '16px' }}>Rapid Response Solutions</h3>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Rapid response to minimize damage. Emergency incident response and real-time threat mitigation to protect your business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Clients Section - Modern Cards */}
        <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #e0f7fa 0%, #f0f9ff 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '48px', color: '#1E40AF' }}>
              Our Clients
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(30, 64, 175, 0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏭</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E40AF', marginBottom: '6px' }}>MTSV Foods Industries Pvt Ltd</h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>Food & Beverage Industry</p>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(30, 64, 175, 0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏗️</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E40AF', marginBottom: '6px' }}>Apple Tree Industries</h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>Manufacturing & Processing</p>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(30, 64, 175, 0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💻</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E40AF', marginBottom: '6px' }}>TechStart Solutions</h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>Technology Consulting</p>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(30, 64, 175, 0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚚</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E40AF', marginBottom: '6px' }}>Global Logistics Corp</h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>Supply Chain Management</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Founder Section */}
        <section style={{ padding: '80px 24px', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '48px', color: '#1E40AF' }}>
              Our Founder
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '400px',
                  margin: '0 auto',
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%)', 
                  borderRadius: '24px',
                  padding: '40px',
                  textAlign: 'center',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(30, 64, 175, 0.15)'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👨‍💼</div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Abhay Pal Chauhan</h3>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '16px' }}>
                    Founder & Principal Consultant
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      18+ Years Experience
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      Cybersecurity Expert
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      Six Sigma Black Belt
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ order: 1 }}>
                <p style={{ color: '#6b7280', fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '24px' }}>
                  Our Founder leverages over <strong style={{ color: '#1E40AF' }}>18 years of expertise</strong> in cybersecurity and process automation and optimization, backed by top certifications in Cybersecurity and <strong style={{ color: '#1E40AF' }}>Black Belt in Lean Six Sigma</strong>.
                </p>
                <p style={{ color: '#6b7280', fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '32px' }}>
                  His unique blend of technical knowledge and operational excellence ensures <strong style={{ color: '#1E40AF' }}>tailored, secure, and efficient solutions</strong> for our clients, driving business resilience and maximizing value in every engagement.
                </p>
                <div style={{ background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 100%)', padding: '24px', borderRadius: '16px', borderLeft: '4px solid #1E40AF' }}>
                  <p style={{ color: '#1E40AF', fontSize: '1.1rem', fontWeight: '600', fontStyle: 'italic' }}>
                    "Delivering top-tier solutions that combine cutting-edge technology with proven operational methodologies to secure and optimize your business operations."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Modern Form */}
        <section id="contact" style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '48px', color: '#1E40AF' }}>
              Get In Touch
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
              {/* Contact Form */}
              <form onSubmit={handleFormSubmit} style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E40AF', marginBottom: '24px' }}>Send us a Message</h3>
                <div style={{ marginBottom: '24px' }}>
                  <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', color: '#1E40AF', fontWeight: 600 }}>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', transition: 'border-color 0.2s ease' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#1E40AF', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', transition: 'border-color 0.2s ease' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label htmlFor="company" style={{ display: 'block', marginBottom: '8px', color: '#1E40AF', fontWeight: 600 }}>Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', transition: 'border-color 0.2s ease' }}
                  />
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <label htmlFor="message" style={{ display: 'block', marginBottom: '8px', color: '#1E40AF', fontWeight: 600 }}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1rem', resize: 'vertical', transition: 'border-color 0.2s ease' }}
                  />
                </div>
                <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%)', color: 'white', padding: '16px', borderRadius: '12px', fontWeight: 600, fontSize: '1.1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(30, 64, 175, 0.20)', transition: 'all 0.2s ease' }}>
                  Send Message
                </button>
              </form>

              {/* Contact Information */}
              <div style={{ background: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 8px 32px rgba(30, 64, 175, 0.08)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E40AF', marginBottom: '24px' }}>Contact Information</h3>
                
                {/* Mailing Address */}
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    📍
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E40AF', marginBottom: '8px' }}>Mailing Address</h4>
                    <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                      Meydan Grandstand, 6th floor<br />
                      Meydan Road, Nad Al Sheba<br />
                      Dubai, U.A.E.
                    </p>
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E40AF 100%)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    ✉️
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1E40AF', marginBottom: '8px' }}>Email Address</h4>
                    <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                      <a href="mailto:abhay@netcopconsultancy.com" style={{ color: '#6366f1', textDecoration: 'none' }}>
                        abhay@netcopconsultancy.com
                      </a>
                    </p>
                  </div>
                </div>

                {/* Commitment Statement */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #f6f8ff 0%, #e8f0fe 100%)', 
                  padding: '24px', 
                  borderRadius: '16px',
                  borderLeft: '4px solid #1E40AF',
                  marginTop: '32px'
                }}>
                  <p style={{ color: '#1E40AF', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>
                    We are committed to deliver top-tier AI & Cybersecurity solutions for businesses of all sizes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shared Footer */}
        <Footer onPrivacyModalOpen={() => setIsPrivacyModalOpen(true)} />
        
        {/* Old footer replaced with shared component */}
        <footer style={{ display: 'none' }} old-footer={{
          padding: '40px 24px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          margin: 0,
          width: '100%',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '48px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              {/* Company Info */}
              <div style={{ flex: '1', minWidth: '300px' }}>
                <div>
                  <img 
                    src="/logo.png" 
                    alt="Netcop Consultancy Logo"
                    style={{
                      height: '80px',
                      width: 'auto',
                      filter: 'brightness(0) invert(1)',
                      marginBottom: '16px'
                    }}
                  />
                  <p style={{ 
                    color: '#94a3b8',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0'
                  }}>
                    Leading cybersecurity consultancy providing comprehensive security solutions and AI-powered automation.
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>📧 contact@netcopconsultancy.com</span>
                    <span style={{ color: '#e2e8f0', fontSize: '13px' }}>📍 Dubai, UAE</span>
                  </div>
                </div>
              </div>

              {/* Services and Company - Right Aligned */}
              <div style={{
                display: 'flex',
                gap: '48px',
                alignItems: 'flex-start'
              }}>
                {/* Services */}
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '12px',
                    fontSize: '16px'
                  }}>
                    Services
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a href="#services" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      Cybersecurity Consulting
                    </a>
                    <a href="#services" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      Risk Assessment
                    </a>
                    <a href="#services" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      Compliance Audits
                    </a>
                    <a href="#services" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      Security Training
                    </a>
                  </div>
                </div>

                {/* Company */}
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '12px',
                    fontSize: '16px'
                  }}>
                    Company
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a href="#company-profile" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      About Us
                    </a>
                    <a href="#founder" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      Leadership
                    </a>
                    <a href="#contact" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      Contact Us
                    </a>
                    <Link href="/marketplace" style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '13px'
                    }}>
                      AI Marketplace
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div style={{
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <p style={{ 
                color: '#64748b',
                margin: 0,
                fontSize: '13px'
              }}>
                © 2025 Netcop Consultancy. All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <button 
                  onClick={() => setIsPrivacyModalOpen(true)}
                  style={{ 
                    color: '#94a3b8', 
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Privacy Policy
                </button>
                <a href="#" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Terms of Service
                </a>
                <a href="#" style={{ 
                  color: '#94a3b8', 
                  textDecoration: 'none',
                  fontSize: '13px'
                }}>
                  Security
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Privacy Policy Modal */}
        {isPrivacyModalOpen && (
          <div style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000, overflowY: 'auto' }}
            onClick={(e) => { if (e.target === e.currentTarget) closePrivacyModal(); }}
          >
            <div style={{ background: 'white', margin: '2rem auto', padding: '2rem', maxWidth: '800px', borderRadius: '12px', position: 'relative' }}>
              <button onClick={closePrivacyModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              <h2 style={{ color: 'var(--dark-blue)', marginBottom: '1.5rem' }}>Netcop Consultancy LLC FZ Privacy Policy</h2>
              
              <p style={{ marginBottom: '1rem' }}>Netcop Consultancy values your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you interact with our business, website, and services.</p>
              
              <h3 style={{ color: 'var(--dark-blue)', margin: '1.5rem 0 1rem 0' }}>1. Information We Collect</h3>
              <p style={{ marginBottom: '1rem' }}>We may collect the following types of personal information:</p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Name, email address, and contact details</li>
                <li>Business or company information</li>
                <li>Information you provide through contact forms, service inquiries, Apps or social media platforms</li>
                <li>Technical data such as IP address, browser type, and interaction with our website or apps</li>
              </ul>
              
              <h3 style={{ color: 'var(--dark-blue)', margin: '1.5rem 0 1rem 0' }}>2. How We Use Your Information</h3>
              <p style={{ marginBottom: '1rem' }}>We use the collected information to:</p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Communicate with you and respond to inquiries</li>
                <li>Provide and improve our consulting services</li>
                <li>Comply with legal or regulatory obligations</li>
                <li>Send updates, newsletters, or marketing (only with your consent)</li>
              </ul>
              
              <h3 style={{ color: 'var(--dark-blue)', margin: '1.5rem 0 1rem 0' }}>3. Sharing of Information</h3>
              <p style={{ marginBottom: '1rem' }}>We do not sell your personal information. We may share data with trusted third-party service providers (e.g., Meta platforms for advertising), only to the extent necessary for our services and in accordance with applicable data protection laws.</p>
              
              <h3 style={{ color: 'var(--dark-blue)', margin: '1.5rem 0 1rem 0' }}>4. Data Security</h3>
              <p style={{ marginBottom: '1rem' }}>We do not collect any PII or PHI and also implement appropriate technical and organizational measures to protect your any other data from unauthorized access, loss, or misuse.</p>
              
              <h3 style={{ color: 'var(--dark-blue)', margin: '1.5rem 0 1rem 0' }}>5. Your Rights</h3>
              <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Access, correct, or delete your personal data</li>
                <li>Withdraw consent at any time</li>
                <li>Object to the processing of your data</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>To exercise any of these rights, contact us using the details below.</p>
              
              <h3 style={{ color: 'var(--dark-blue)', margin: '1.5rem 0 1rem 0' }}>6. Contact Us</h3>
              <p style={{ marginBottom: '1rem' }}>If you have any questions or concerns about this Privacy Policy, please contact:</p>
              <p style={{ marginBottom: '1rem' }}><strong>Netcop Consultancy</strong><br />
              Email: abhay@netcopconsultancy.com</p>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {user && (
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            userId={user.id}
            position={dropdownPosition}
          />
        )}
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          setAuthMode={setAuthMode}
        />
      </div>
    </>
  );
};

export default HomePage;