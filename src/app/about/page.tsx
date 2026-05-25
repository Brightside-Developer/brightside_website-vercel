'use client';

import React from 'react';
import PageHero from '@/components/PageHero';
import RevealOnScroll from '@/components/RevealOnScroll';
import SectionHeader from '@/components/SectionHeader';

export default function About() {
  const values = [
    {
      title: 'Free-Forever',
      desc: 'Every resource we create is free, forever. No paywalls, no subscriptions, no barriers.',
    },
    {
      title: 'Designed for all ages',
      desc: 'Our resources are tailored to meet the needs of all age demographics.',
    },
    {
      title: 'Community-First',
      desc: 'We partner with local schools, libraries, and community centers to bring financial education directly into people\'s lives.',
    },
  ];

  const timeline = [
    {
      year: 'August 2024 - Founded',
      title: 'An idea becomes a reality',
      desc: 'Co-founders Shashank Kamineni, Vijay Venkatesan, and Samuel Deepak launch Aspire Finance with one common goal in mind: to address the declining financial literacy rate in Texas.',
    },
    {
      year: 'October 2024 - First Seminars',
      title: 'Initial Seminars at Reedy High School',
      desc: 'After finalizing the curriculum, Aspire Finance hosts its first seminars at Reedy High School, bringing financial literacy education directly to the community.',
    },
    {
      year: 'December 2024 - Creation of Products',
      title: 'Aspire Finance broadens its horizons',
      desc: 'The team develops a suite of products for the community to enjoy. This includes a board game, a mobile app, and a website.',
    },
    {
      year: 'March 2025 - State Finalist',
      title: 'Reaching a State-wide Audience',
      desc: 'Aspire Finance earns state-level recognition at the Texas DECA State Career Development Conference, validating its mission and impact across Texas.',
    },
    {
      year: 'January 2026 - Brightside Finance Rebrand',
      title: 'New Light; Same Vision.',
      desc: 'The team relaunched under the Brightside Finance brand to pursue a broader vision of Financial Literacy while expanding its workforce significantly.',
      isLatest: true,
    },
  ];

  const team = [
    {
      name: 'Shashank Kamineni',
      role: 'Co-Founder & Chief Executive Officer',
      bio: 'Oversees overall direction, monitors performance and motivates team to achieve mission statement.',
      img: '/shashank_kamineni.jpeg',
    },
    {
      name: 'Govinda Veeramalla',
      role: 'Co-Founder & Chief Financial Officer',
      bio: 'Responsible for managing finance planning, budgeting, and reporting. Oversees strategy, monitor cash flow, and ensure the organization remains stable.',
      img: '/govinda_veeramalla.jpeg',
    },
    {
      name: 'Samuel Deepak',
      role: 'Chief Operating Officer & Medical Finance Lead',
      bio: 'Oversees day-to-day operations, implementing strategies to improve efficiency, productivity, and quality. Leads Medical Division, providing leadership with objectives aligning with Brightside’s goals.',
      img: '/samuel_deepak.png',
    },
    {
      name: 'Vijay Mukund Suganthi',
      role: 'Chief Technical Officer & Legal Head',
      bio: 'Oversees the technical team and ensure our systems, software, and innovations are built efficiently and reliably. Heads the legal team, making sure that Brightside is compliant with rules and regulations.',
      img: '/vijay_mukund.jpeg',
    },
    {
      name: 'Yash Grewal',
      role: 'Chief Marketing Officer',
      bio: 'Drives our marketing strategy and brand growth. They lead campaigns, analyze market trends, and help us connect with our audience in meaningful ways.',
      img: '/yash_grewal.jpeg',
    },
    {
      name: 'Jyotir Manchu',
      role: 'Creative Works Lead',
      bio: 'Guides the visual and creative direction of our projects. Coordinates the creative team and ensures our designs, media, and content reflect our brand and vision.',
      img: '/jyotir_manchu.jpg',
    },
    {
      name: 'Zain Faruki',
      role: 'Creative Works',
      bio: 'Our Creative Works team brings ideas to life through design, media, and content creation. They develop the visuals and creative materials that help tell our story.',
      img: '/zain_faruki.jpg',
    },
    {
      name: 'Saket Parayil',
      role: 'Generalist',
      bio: 'Our Generalist supports multiple areas of the team and helps keep everything running smoothly. They assist with a variety of tasks and step in wherever help is needed.',
      img: '/saket_parayil.jpg',
    },
    {
      name: 'Ishan Pachnanda',
      role: 'Outreach',
      bio: 'Focuses on building connections with communities, partners, and organizations. They help expand our reach and spread awareness about our mission.',
      img: '/ishan_pachnanda.png',
    },
    {
      name: 'Dhruv Pediredla',
      role: 'Marketing & Creative Design',
      bio: 'Supports Brightside’s marketing efforts while creating visual designs and artwork to enhance branding. Helps improve outreach and engagement by communicating Brightside’s mission creatively.',
      img: '/dhruv_pediredla.jpeg',
    },
  ];

  const partners = [
    'Financial Freedom Initiative',
  ];

  return (
    <div className="flex flex-col">
      {/* --- HERO SECTION --- */}
      <PageHero
        eyebrow="Our Story"
        title={<>Built on the belief that <em>everyone deserves</em> financial confidence</>}
        description="Brightside Finance Foundation is a comprehensive initiative designed to empower students and adults with essential financial literacy skills. By providing accessible tools, interactive workshops, and tailored resources, Brightside equips individuals to confidently manage budgets, navigate financial challenges, and build a strong foundation for long-term financial independence."
      />

      {/* --- MISSION SECTION --- */}
      <section className="bg-warm-white dark:bg-[#1a1f1a] py-24 px-6 md:px-16 transition-colors duration-200">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual card stack */}
          <RevealOnScroll className="hidden lg:block">
            <div className="relative h-[360px]">
              <div className="absolute top-0 left-0 right-[40px] bg-primary dark:bg-[#111511] border border-white/5 dark:border-mint/10 rounded-[24px] h-[280px] flex flex-col justify-end p-8 overflow-hidden shadow-lg before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_70%_70%_at_80%_20%,rgba(142,186,126,0.25)_0%,transparent_60%)]">
                <div className="relative z-10">
                  <div className="font-serif text-5xl md:text-6xl font-black text-gold-light dark:text-mint leading-none">
                    1900+
                  </div>
                  <div className="text-cream/70 dark:text-[#8fa887] text-sm mt-2 font-medium">
                    people reached since founding
                  </div>
                </div>
              </div>
              <div className="absolute top-[-16px] right-[80px] bg-secondary text-primary rounded-xl px-4 py-2 font-bold text-xs shadow-md border border-secondary-dark/10">
                Est. 2025
              </div>
            </div>
          </RevealOnScroll>

          {/* Mission Text */}
          <RevealOnScroll delay={0.2}>
            <div>
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary-light dark:text-[#6b9960] block mb-3">
                {'// Our Mission'}
              </span>
              <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-black text-primary dark:text-[#e8f0e0] leading-[1.15] mb-5">
                Why we exist
              </h2>
              <p className="text-[#576455] dark:text-[#8fa887] text-base leading-relaxed mb-8 max-w-[500px]">
                Nearly two-thirds of Americans can&apos;t pass a basic financial literacy test. We believe that&apos;s not a personal failure — it&apos;s an educational gap we can close together.
              </p>
              
              {/* Values List */}
              <div className="flex flex-col gap-5 mt-6">
                {values.map((v) => (
                  <div key={v.title} className="flex gap-4 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint mt-1.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-primary dark:text-[#e8f0e0] mb-0.5">
                        {v.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-[#6b7280] dark:text-[#8fa887]">
                        {v.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* --- STORY TIMELINE --- */}
      <section className="bg-cream dark:bg-[#111511] py-24 px-6 md:px-16 transition-colors duration-200">
        <div className="max-w-[800px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="Our Journey"
              title="How we got here"
              centered
            />
          </RevealOnScroll>

          <RevealOnScroll delay={0.2} className="mt-14">
            <div className="relative pl-10 border-l-2 border-gradient-to-b border-mint dark:border-mint/30">
              <div className="absolute left-[-2px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-mint via-gold to-sage rounded"></div>
              
              {timeline.map((item) => (
                <div key={item.title} className="relative mb-12 last:mb-0">
                  {/* Dot */}
                  <div
                    className={`absolute left-[-49px] top-1 w-4.5 h-4.5 rounded-full border-[3px] border-white dark:border-[#111511] ${
                      item.isLatest
                        ? 'bg-mint shadow-[0_0_0_3px_rgba(142,186,126,0.3)]'
                        : 'bg-gold shadow-[0_0_0_3px_rgba(168,172,148,0.25)]'
                    }`}
                  ></div>
                  
                  <span className="font-mono text-[10px] tracking-widest text-gold dark:text-[#8fa887] uppercase block mb-1">
                    {item.year}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-primary dark:text-[#e8f0e0] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6b7280] dark:text-[#8fa887]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="bg-warm-white dark:bg-[#1a1f1a] py-24 px-6 md:px-16 transition-colors duration-200" id="team">
        <div className="max-w-[1100px] mx-auto">
          <RevealOnScroll>
            <SectionHeader
              label="The People"
              title="Our team"
              subtitle="Educators and community advocates united by a single mission."
              centered
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-14">
            {team.map((member, idx) => (
              <RevealOnScroll key={member.name} delay={(idx % 5) * 0.08}>
                <div className="bg-white dark:bg-[#242924] border border-primary/5 dark:border-mint/10 rounded-2xl p-4 text-center h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
                  <div className="w-[120px] h-[120px] rounded-full mx-auto mb-4 overflow-hidden border-2 border-primary/10 group-hover:border-mint transition-colors">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <h3 className="font-serif text-sm font-bold text-primary dark:text-[#e8f0e0] tracking-tight leading-snug mb-1">
                    {member.name}
                  </h3>
                  <div className="text-[10px] text-sage dark:text-mint font-bold uppercase tracking-wider leading-snug mb-3">
                    {member.role}
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#6b7280] dark:text-[#8fa887] text-left">
                    {member.bio}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- PARTNERS CHIPS --- */}
      <section className="bg-cream dark:bg-[#111511] py-16 px-6 md:px-16 text-center transition-colors duration-200">
        <div className="max-w-[900px] mx-auto">
          <RevealOnScroll>
            <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary-light dark:text-[#6b9960] block mb-3">
              {'// Partner Network'}
            </span>
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-black text-primary dark:text-[#e8f0e0] mb-6">
              Organizations we work with
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="flex flex-wrap justify-center gap-3.5 mt-8">
              {partners.map((p) => (
                <span
                  key={p}
                  className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-xl px-6 py-3 font-semibold text-sm text-primary dark:text-[#e8f0e0] shadow-sm hover:border-sage dark:hover:border-mint hover:shadow-md transition-all cursor-pointer"
                >
                  {p}
                </span>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
