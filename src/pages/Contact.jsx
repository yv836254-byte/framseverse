import React, { useState } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  Send,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TwitterIcon, LinkedinIcon } from '../components/common/SocialIcons';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Commercial Campaign',
    budget: '$10k - $25k',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name or company is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please provide brief details about your project';
    } else if (formData.message.trim().length < 15) {
      errs.message = 'Message must be at least 15 characters long';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('Please fix the errors in the form before submitting.', 'error');
      return;
    }

    setSubmitting(true);

    // Simulate sending inquiry
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast('Thank you! Your project inquiry has been transmitted to Yashu.', 'success');
      setFormData({
        name: '',
        email: '',
        projectType: 'Commercial Campaign',
        budget: '$10k - $25k',
        message: '',
      });
      setErrors({});
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#171717] dark:text-[#FAFAFA] pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-500 font-sans">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center sm:text-left space-y-3">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#FF6B4A] font-semibold block">
          Direct Commission & Collaboration
        </span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] dark:text-[#FAFAFA] tracking-tight leading-tight">
          Let's Create Something Extraordinary
        </h1>
        <p className="text-sm sm:text-base text-[#737373] dark:text-[#A3A3A3] max-w-2xl font-light leading-relaxed">
          Whether you have a fully formed creative treatment or are exploring initial concepts, reach out to <strong>Yashu</strong> directly or fill out the project brief below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center mx-auto border border-[#FF6B4A]/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#171717] dark:text-[#FAFAFA]">Inquiry Transmitted</h3>
                <p className="text-sm text-[#737373] dark:text-[#A3A3A3] max-w-md mx-auto font-light leading-relaxed">
                  Thank you for reaching out! Yashu will review your creative brief, timeline, and deliverables within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-primary mt-4 px-6 py-2.5 rounded-xl text-xs font-mono font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                      Your Name / Company <span className="text-[#FF6B4A]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Christopher Nolan"
                      className={`w-full px-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:ring-[#FF6B4A]/50 ${
                        errors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                      Email Address <span className="text-[#FF6B4A]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. director@studio.com"
                      className={`w-full px-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:ring-[#FF6B4A]/50 ${
                        errors.email ? 'border-rose-500 ring-1 ring-rose-500' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-mono">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Project Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                      Project Type
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] focus:ring-[#FF6B4A]/50"
                    >
                      <option value="Commercial Campaign">Commercial Campaign</option>
                      <option value="Music Video">Music Video</option>
                      <option value="Narrative Film">Narrative Film</option>
                      <option value="Documentary">Documentary</option>
                      <option value="Color Grading & Post">Color Grading & Post</option>
                      <option value="Other Creative Direction">Other Creative Direction</option>
                    </select>
                  </div>

                  {/* Estimated Budget */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                      Estimated Production Budget
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] focus:ring-[#FF6B4A]/50"
                    >
                      <option value="Under $10k">Under $10k</option>
                      <option value="$10k - $25k">$10k - $25k</option>
                      <option value="$25k - $50k">$25k - $50k</option>
                      <option value="$50k+">$50k+</option>
                      <option value="Undetermined / In Discussion">Undetermined / In Discussion</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                    Project Brief & Creative Vision <span className="text-[#FF6B4A]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the project goals, timeline, deliverable formats, visual inspirations, and intended mood..."
                    className={`w-full px-4 py-3 rounded-xl glass-input text-sm text-[#171717] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:ring-[#FF6B4A]/50 resize-none ${
                      errors.message ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-mono">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider"
                >
                  {submitting ? (
                    <span>Transmitting Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Project Brief</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Studio Direct Coordinates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#F5F5F5] dark:bg-[#171717] border border-[#E5E5E5] dark:border-[#262626] space-y-6 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#171717] dark:text-[#FAFAFA] font-semibold border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              Direct Contact Coordinates
            </h3>

            <div className="space-y-5">
              {/* Director info */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block">
                    Director & Lead Cinematographer
                  </span>
                  <span className="text-[#171717] dark:text-[#FAFAFA] font-bold text-base">
                    Yashu
                  </span>
                  <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">Commercials, Music Videos, Narrative Films</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block">
                    Direct Email
                  </span>
                  <a
                    href="mailto:contact@frameverse.studio"
                    className="text-[#171717] dark:text-[#FAFAFA] font-semibold hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors font-mono text-xs"
                  >
                    contact@frameverse.studio
                  </a>
                  <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">Replies within 24 business hours</p>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block">
                      Mobile & WhatsApp
                    </span>
                    <a
                      href="tel:7396354633"
                      className="text-[#171717] dark:text-[#FAFAFA] font-semibold hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition-colors font-mono text-xs"
                    >
                      +91 7396354633
                    </a>
                  </div>

                  <a
                    href="https://wa.me/917396354633?text=Hi%20Yashu,%20I'd%20like%20to%20discuss%20a%20video%20portfolio%20production%20project!"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block">
                    Studio Base
                  </span>
                  <p className="text-[#171717] dark:text-[#FAFAFA] font-semibold">
                    Medikonduru, Guntur District
                  </p>
                  <p className="text-[#737373] dark:text-[#A3A3A3] text-xs">
                    Andhra Pradesh, India
                  </p>
                  <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3] mt-0.5">Available for nationwide & international travel</p>
                </div>
              </div>

              {/* Booking status */}
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A0A0A] text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block">
                    Current Availability
                  </span>
                  <p className="text-[#FF6B4A] font-bold text-xs font-mono">
                    Booking Q3 / Q4 2026 Productions
                  </p>
                </div>
              </div>
            </div>

            {/* Social Network Channels */}
            <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#262626] space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#A3A3A3] block font-semibold">
                Social Networks & Channels
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://youtube.com/@antony__memes?si=YI78q4_SqXWgUmqA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0A0A0A] text-[#737373] dark:text-[#A3A3A3] hover:text-red-500 border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/yashu._jammula_?stkn=MWRuNGdjM2tnZDBmcw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0A0A0A] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://x.com/yashu_directs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0A0A0A] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                  aria-label="X Twitter"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yashovardhan-jammula-57aa63372"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white dark:bg-[#0A0A0A] text-[#737373] dark:text-[#A3A3A3] hover:text-[#FF6B4A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
