import React, { useState } from 'react';
import { FAQItem } from '../types';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQSection({ items, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!items || items.length === 0) return null;

  return (
    <section id="faq-section" className="my-16 mx-auto w-full max-w-4xl border-t border-zinc-100 pt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-600">
          <HelpCircle className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-800 tracking-tight">{title}</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 ${
                isOpen
                  ? 'border-zinc-300 bg-white shadow-sm'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300'
              }`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 text-left font-medium text-zinc-800"
                onClick={() => toggleIndex(index)}
                aria-expanded={isOpen}
              >
                <span className="pr-4 text-base md:text-md">{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 border-t border-zinc-100 text-sm md:text-base leading-relaxed text-zinc-600 whitespace-pre-line">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
