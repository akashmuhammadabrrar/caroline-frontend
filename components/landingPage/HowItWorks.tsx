"use client";
import { useAppSelector } from "@/redux/hooks";
import { UserPlus, FileText, Heart, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Join",
    description: "Sign up and create your account in under 2 minutes",
  },
  {
    number: "02",
    icon: FileText,
    title: "Build Profile",
    description: "Showcase your skills, stats, and highlight videos",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Get Discovered",
    description: "Connect with scouts and clubs worldwide",
  },
];

const HowItWorks = () => {
  const theme = useAppSelector((state) => state.theme);
  return (
    <section className="py-10 px-4 bg-[var(--bg-dark,#07142b)] text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 inline-block text-white">
            HOW IT WORKS
          </h2>
          <p className="text-landing mt-2">
            Your journey to professional football starts with three simple
            steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="group relative">
              {/* Main Card with Gradient Border */}
              <div className="relative p-8 md:p-10 rounded-2xl bg-[var(--bg-card,#0A1424)] h-full">
                {/* Gradient Border using pseudo-element */}
                <div
                  className="absolute inset-0 rounded-2xl p-[2px] bg-linear-to-br opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primaryCyan}, ${theme.colors.primaryMagenta})`,
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    pointerEvents: "none",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Step Number with Staggered Position */}
                  <div
                    className={`font-display text-7xl md:text-8xl font-black mb-4 ${
                      index === 0
                        ? "self-center -mt-4 ml-[-0.5rem]"
                        : index === 1
                          ? "self-center"
                          : "self-center -mt-2 mr-[-0.5rem]"
                    }`}
                    style={{ color: "#09585E" }}
                  >
                    {step.number}
                  </div>

                  {/* Icon with Gradient Background */}
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primaryCyan}20, ${theme.colors.primaryMagenta}20)`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primaryCyan}, ${theme.colors.primaryMagenta})`,
                      }}
                    >
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
