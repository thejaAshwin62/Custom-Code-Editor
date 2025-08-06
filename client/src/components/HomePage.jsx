"use client";

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiSparklingLine,
  RiRocketLine,
  RiArrowRightLine,
  RiCheckLine,
  RiStarFill,
  RiPlayCircleLine,
  RiLightbulbLine,
  RiFlashlightLine,
  RiBrainLine,
} from "react-icons/ri";

const HomePage = () => {
  const { theme, onGetStarted, onShowCodeTreasure } = useOutletContext();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <RiBrainLine className="w-8 h-8" />,
      title: "AI-Powered Coding",
      description:
        "Get intelligent code suggestions, explanations, and improvements powered by advanced AI models.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: <RiFlashlightLine className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time with synchronized code editing and AI assistance.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: <RiLightbulbLine className="w-8 h-8" />,
      title: "Smart Code Analysis",
      description:
        "Understand your code better with AI-driven analysis, performance insights, and optimization tips.",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: <RiRocketLine className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Experience blazing-fast performance with optimized AI inference and responsive UI interactions.",
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer at TechCorp",
      avatar: "/professional-woman-developer.png",
      content:
        "AI Code Studio Pro has revolutionized my development workflow. The AI suggestions are incredibly accurate and save me hours every day.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO at StartupXYZ",
      avatar: "/professional-man-developer.png",
      content:
        "The best coding assistant I've ever used. It's like having a senior developer pair programming with you 24/7.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Full Stack Developer",
      avatar: "/professional-woman-programmer.png",
      content:
        "Game-changer for our team. The collaborative features and AI insights have improved our code quality significantly.",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for individual developers getting started",
      features: [
        "AI Code Suggestions",
        "Basic Code Analysis",
        "5 Projects",
        "Community Support",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For professional developers and small teams",
      features: [
        "Everything in Starter",
        "Advanced AI Features",
        "Unlimited Projects",
        "Real-time Collaboration",
        "Priority Support",
        "Custom AI Models",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "On-premise Deployment",
        "Custom Integrations",
        "Advanced Security",
        "Dedicated Support",
        "SLA Guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const stats = [
    { value: "50K+", label: "Developers" },
    { value: "1M+", label: "Lines of Code" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className={`w-full ${theme === "dark" ? "bg-slate-950" : "bg-white"}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
          }`}
        />
        <div className="absolute inset-0">
          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full animate-pulse ${
                theme === "dark" ? "bg-emerald-400/20" : "bg-blue-400/20"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        {/* Gradient orbs */}
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            theme === "dark" ? "bg-emerald-500" : "bg-blue-500"
          }`}
          style={{ animation: "float 6s ease-in-out infinite" }}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            theme === "dark" ? "bg-blue-500" : "bg-purple-500"
          }`}
          style={{ animation: "float 8s ease-in-out infinite reverse" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div
              className={`text-center transform transition-all duration-1000 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {/* Hero Badge */}
              <div
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-600 border border-emerald-500/20"
                } backdrop-blur-xl shadow-lg`}
              >
                <RiSparklingLine className="w-4 h-4" />
                <span>Powered by Advanced AI Technology</span>
              </div>

              {/* Hero Title */}
              <h1
                className={`text-6xl md:text-8xl font-bold mb-8 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Code with
                <span
                  className={`block bg-gradient-to-r ${
                    theme === "dark"
                      ? "from-emerald-400 via-blue-400 to-purple-400"
                      : "from-emerald-600 via-blue-600 to-purple-600"
                  } bg-clip-text text-transparent`}
                >
                  AI Superpowers
                </span>
              </h1>

              {/* Hero Subtitle */}
              <p
                className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Transform your development workflow with intelligent code
                suggestions, real-time collaboration, and AI-powered insights
                that make you 10x more productive.
              </p>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                <button
                  onClick={onGetStarted}
                  className={`group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-2xl shadow-emerald-500/25"
                      : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-2xl shadow-emerald-500/25"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>Start Coding Now</span>
                    <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={onShowCodeTreasure}
                  className={`group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-purple-500/25"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-2xl shadow-purple-500/25"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <RiSparklingLine className="w-5 h-5" />
                    <span>Code Treasure</span>
                  </span>
                </button>
                {/* <button
                  className={`group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-slate-800/50 hover:bg-slate-800/70 text-white border border-slate-700/50 hover:border-slate-600/70 backdrop-blur-xl"
                      : "bg-white/50 hover:bg-white/70 text-gray-900 border border-gray-300/50 hover:border-gray-400/70 backdrop-blur-xl"
                  } shadow-xl`}
                >
                  <span className="flex items-center space-x-2">
                    <RiPlayCircleLine className="w-5 h-5" />
                    <span>Watch Demo</span>
                  </span>
                </button> */}
              </div>

              {/* Hero Image */}
              <div className="relative max-w-5xl mx-auto">
                <div
                  className={`rounded-3xl overflow-hidden shadow-2xl border ${
                    theme === "dark"
                      ? "border-slate-700/50"
                      : "border-gray-200/50"
                  } backdrop-blur-xl`}
                >
                  <img
                    src="/ai-code-editor.png"
                    alt="AI Code Studio Pro Interface"
                    className="w-full h-auto"
                  />
                  {/* Overlay gradient */}
                  <div
                    className={`absolute inset-0 ${
                      theme === "dark"
                        ? "bg-gradient-to-t from-slate-950/20 to-transparent"
                        : "bg-gradient-to-t from-white/20 to-transparent"
                    }`}
                  />
                </div>
                {/* Floating elements */}
                <div
                  className={`absolute -top-4 -right-4 w-20 h-20 rounded-2xl ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
                      : "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
                  } backdrop-blur-xl flex items-center justify-center`}
                  style={{ animation: "float 3s ease-in-out infinite" }}
                >
                  <RiSparklingLine
                    className={`w-8 h-8 ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[800px]">
              {/* Features Section - Large */}
              <div className="lg:col-span-8 lg:row-span-2">
                <div
                  className={`h-full rounded-3xl border backdrop-blur-xl p-8 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50"
                      : "bg-gradient-to-br from-white/60 to-gray-50/60 border-gray-200/50"
                  } shadow-2xl relative overflow-hidden`}
                  style={{
                    boxShadow: `inset 0 1px 0 ${
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.8)"
                    }, 0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
                  }}
                >
                  {/* Inverted border effect */}
                  <div
                    className={`absolute inset-0 rounded-3xl ${
                      theme === "dark"
                        ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]"
                        : "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
                    }`}
                  />

                  <div className="relative z-10 h-full flex flex-col">
                    <div className="mb-8">
                      <h2
                        className={`text-4xl font-bold mb-4 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Powerful Features
                      </h2>
                      <p
                        className={`text-lg ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Everything you need to supercharge your development
                        workflow
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className={`group p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                            activeFeature === index
                              ? theme === "dark"
                                ? "bg-slate-700/50 border border-slate-600/50"
                                : "bg-white/50 border border-gray-300/50"
                              : theme === "dark"
                              ? "hover:bg-slate-700/30 border border-transparent hover:border-slate-600/30"
                              : "hover:bg-white/30 border border-transparent hover:border-gray-300/30"
                          } backdrop-blur-sm`}
                          onMouseEnter={() => setActiveFeature(index)}
                          style={{
                            boxShadow:
                              activeFeature === index
                                ? `inset 0 1px 0 ${
                                    theme === "dark"
                                      ? "rgba(255, 255, 255, 0.1)"
                                      : "rgba(255, 255, 255, 0.8)"
                                  }`
                                : "none",
                          }}
                        >
                          <div
                            className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-r ${feature.gradient} shadow-lg`}
                          >
                            <div className="text-white">{feature.icon}</div>
                          </div>
                          <h3
                            className={`text-xl font-semibold mb-2 ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {feature.title}
                          </h3>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="lg:col-span-4">
                <div
                  className={`h-full rounded-3xl border backdrop-blur-xl p-8 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50"
                      : "bg-gradient-to-br from-white/60 to-gray-50/60 border-gray-200/50"
                  } shadow-2xl relative overflow-hidden`}
                  style={{
                    boxShadow: `inset 0 1px 0 ${
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.8)"
                    }, 0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-3xl ${
                      theme === "dark"
                        ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]"
                        : "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
                    }`}
                  />

                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <h3
                      className={`text-2xl font-bold mb-8 text-center ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Trusted by Developers
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div
                            className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                              theme === "dark"
                                ? "from-emerald-400 to-blue-400"
                                : "from-emerald-600 to-blue-600"
                            } bg-clip-text text-transparent`}
                          >
                            {stat.value}
                          </div>
                          <div
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="lg:col-span-4">
                <div
                  className={`h-full rounded-3xl border backdrop-blur-xl p-8 ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50"
                      : "bg-gradient-to-br from-white/60 to-gray-50/60 border-gray-200/50"
                  } shadow-2xl relative overflow-hidden`}
                  style={{
                    boxShadow: `inset 0 1px 0 ${
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.8)"
                    }, 0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
                  }}
                >
                  <div
                    className={`absolute inset-0 rounded-3xl ${
                      theme === "dark"
                        ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]"
                        : "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
                    }`}
                  />

                  <div className="relative z-10 h-full flex flex-col">
                    <h3
                      className={`text-2xl font-bold mb-6 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      What Developers Say
                    </h3>
                    <div className="space-y-6 flex-1 overflow-y-auto">
                      {testimonials.slice(0, 2).map((testimonial, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-2xl ${
                            theme === "dark"
                              ? "bg-slate-700/30 border border-slate-600/30"
                              : "bg-white/30 border border-gray-300/30"
                          } backdrop-blur-sm`}
                          style={{
                            boxShadow: `inset 0 1px 0 ${
                              theme === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.5)"
                            }`,
                          }}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <img
                              src={testimonial.avatar || "/placeholder.svg"}
                              alt={testimonial.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div
                                className={`font-semibold text-sm ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {testimonial.name}
                              </div>
                              <div
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {testimonial.role}
                              </div>
                            </div>
                          </div>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            "{testimonial.content}"
                          </p>
                          <div className="flex items-center space-x-1 mt-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <RiStarFill
                                key={i}
                                className="w-4 h-4 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className={`text-5xl font-bold mb-6 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Choose Your Plan
              </h2>
              <p
                className={`text-xl ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Start free, scale as you grow. No hidden fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-3xl border backdrop-blur-xl p-8 transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? theme === "dark"
                        ? "bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-500/20"
                        : "bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
                      : theme === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-slate-600/70"
                      : "bg-gradient-to-br from-white/60 to-gray-50/60 border-gray-200/50 hover:border-gray-300/70"
                  } shadow-2xl`}
                  style={{
                    boxShadow: `inset 0 1px 0 ${
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.8)"
                    }, 0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
                  }}
                >
                  {/* Inverted border effect */}
                  <div
                    className={`absolute inset-0 rounded-3xl ${
                      plan.popular
                        ? theme === "dark"
                          ? "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                          : "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]"
                        : theme === "dark"
                        ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]"
                        : "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
                    }`}
                  />

                  {plan.popular && (
                    <div
                      className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                          : "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                      } shadow-lg`}
                    >
                      Most Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <h3
                        className={`text-2xl font-bold mb-2 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span
                          className={`text-4xl font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {plan.price}
                        </span>
                        {plan.period !== "contact us" && (
                          <span
                            className={`text-lg ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            /{plan.period}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <RiCheckLine
                            className={`w-5 h-5 ${
                              theme === "dark"
                                ? "text-emerald-400"
                                : "text-emerald-600"
                            } flex-shrink-0`}
                          />
                          <span
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={onGetStarted}
                      className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? theme === "dark"
                            ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg shadow-emerald-500/25"
                          : theme === "dark"
                          ? "bg-slate-700/50 hover:bg-slate-700/70 text-white border border-slate-600/50 hover:border-slate-600/70"
                          : "bg-white/50 hover:bg-white/70 text-gray-900 border border-gray-300/50 hover:border-gray-400/70"
                      } backdrop-blur-sm shadow-lg`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={`rounded-3xl border backdrop-blur-xl p-12 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50"
                  : "bg-gradient-to-br from-white/60 to-gray-50/60 border-gray-200/50"
              } shadow-2xl relative overflow-hidden`}
              style={{
                boxShadow: `inset 0 1px 0 ${
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.8)"
                }, 0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
              }}
            >
              <div
                className={`absolute inset-0 rounded-3xl ${
                  theme === "dark"
                    ? "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.1)]"
                    : "shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
                }`}
              />

              <div className="relative z-10">
                <h2
                  className={`text-4xl md:text-5xl font-bold mb-6 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Ready to Transform Your Coding?
                </h2>
                <p
                  className={`text-xl mb-8 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Join thousands of developers who are already coding smarter,
                  not harder.
                </p>
                <button
                  onClick={onGetStarted}
                  className={`group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-2xl shadow-emerald-500/25"
                      : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-2xl shadow-emerald-500/25"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>Start Your Free Trial</span>
                    <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
      `}</style>
    </div>
  );
};

export default HomePage;
