import React, { useState } from 'react';
import { AppRoute } from '../../types';
import { ArrowLeft, Check, Send, Mail, MapPin } from 'lucide-react';

interface ContactProps {
  onNavigate: (route: AppRoute) => void;
}

export default function Contact({ onNavigate }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Simulate standard feedback email submission
    setIsSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 text-left">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column info */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Contact Us</h1>
            <p className="text-base text-zinc-600 leading-relaxed">
              Have questions, feedback, or custom feature requests for FastImage.tools? Fill out our contact form and our developer support team will get back to you shortly.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-zinc-600">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="text-sm">
                <span className="font-bold text-zinc-400 uppercase text-[10px] block">Email Support</span>
                <span className="font-semibold text-zinc-800">support@fastimage.tools</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-600">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div className="text-sm">
                <span className="font-bold text-zinc-400 uppercase text-[10px] block">Global Headquarters</span>
                <span className="font-semibold text-zinc-800">London, United Kingdom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          {isSent ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-4 animate-in fade-in duration-200">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Message Sent Successfully</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Thank you for reaching out! We have received your feedback and will review your comments.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-base pb-2 border-b border-zinc-100">Feedback Form</h3>

              <div className="space-y-1.5">
                <label htmlFor="name-input" className="block text-xs font-semibold text-zinc-500">Your Name</label>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-semibold text-zinc-500">Email Address</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message-input" className="block text-xs font-semibold text-zinc-500">Message Content</label>
                <textarea
                  id="message-input"
                  required
                  rows={4}
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-zinc-800 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
                Send Feedback Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
