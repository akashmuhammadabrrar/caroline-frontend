"use client";

import { useGetAllFaqsQuery } from "@/redux/features/faq/faq";
import React, { useState } from "react";
import { Plus } from "lucide-react";

const FAQSection = () => {
  const { data, isLoading, isError } = useGetAllFaqsQuery();
  const [openId, setOpenId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20 bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (isError) return <p className="text-center text-destructive py-8 font-medium">Failed to load FAQs. Please try again later.</p>;

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="relative w-full py-24 bg-transparent overflow-hidden">
      <div className="relative w-full max-w-4xl mx-auto px-6 z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our services. Can't find the answer you're looking for? Feel free to contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {data?.data.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`group rounded-2xl border transition-all duration-300 ease-out backdrop-blur-sm ${
                  isOpen 
                    ? "bg-white border-primary/50 shadow-lg" 
                    : "bg-card/60 border-border shadow-sm hover:shadow-md hover:bg-card"
                }`}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className={`text-lg md:text-xl font-semibold transition-colors duration-300 pr-4 ${isOpen ? "text-primary" : "text-white group-hover:text-primary/80"}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-primary/20 text-primary rotate-45" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0">
                      <p className="text-muted-foreground leading-relaxed md:text-lg">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;