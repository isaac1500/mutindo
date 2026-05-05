const { db } = require('../config/firebase');

const defaultContent = {
  home: {
    hero: {
      primaryButtonText: "Order Now",
      primaryButtonLink: "/menu",
      secondaryButtonText: "Catering Services",
      secondaryButtonLink: "/catering",
      slides: [
        { id: 1, title: "Taste of Uganda", subtitle: "Luwombo & Matooke", desc: "Traditional banana-leaf steamed dishes, slow-cooked to perfection.", tag: "Local Special", accent: "#FF6B35", image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600" },
        { id: 2, title: "Grilled Perfection", subtitle: "Nile Perch & Tilapia", desc: "Fresh-caught fish from Lake Victoria, seasoned with Ugandan spices.", tag: "Chef's Pick", accent: "#00C9A7", image: "https://images.pexels.com/photos/1164717/pexels-photo-1164717.jpeg?auto=compress&cs=tinysrgb&w=1600" },
        { id: 3, title: "Street Food Royalty", subtitle: "Rolex & Samosas", desc: "Kampala's iconic street food elevated — crispy chapati rolls.", tag: "Fan Favourite", accent: "#FFD700", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1600" }
      ]
    },
    stats: [
      { num: "2,400+", label: "Orders Delivered" },
      { num: "98%", label: "Happy Customers" },
      { num: "30min", label: "Avg. Delivery Time" },
      { num: "7", label: "Years Serving Kampala" }
    ],
    menuPreview: {
      sectionLabel: "What We Serve",
      sectionTitle: "Signature Dishes",
      viewAllLink: "/menu",
      items: [
        { name: "Matooke & Beef", tag: "Local Special", desc: "Steamed green bananas with beef stew.", price: "UGX 12,000", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { name: "Grilled Tilapia", tag: "Chef's Pick", desc: "Fresh Nile perch with spices.", price: "UGX 25,000", image: "https://images.pexels.com/photos/1164717/pexels-photo-1164717.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { name: "Super Rolex", tag: "Fan Favourite", desc: "Chapati with eggs, cheese, avocado.", price: "UGX 8,000", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { name: "Chicken Pilau", tag: "Best Seller", desc: "Spiced rice with tender chicken.", price: "UGX 15,000", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800" }
      ]
    },
    testimonials: {
      sectionLabel: "What People Say",
      sectionTitle: "Loved across Kampala",
      items: [
        { name: "Amara N.", text: "Best catering in Kampala!", stars: 5 },
        { name: "David K.", text: "The Luwombo is exactly like my grandmother used to make it.", stars: 5 },
        { name: "Sarah M.", text: "Fast delivery and food was still piping hot!", stars: 5 }
      ]
    },
    cta: {
      title: "Ready to taste something unforgettable?",
      subtitle: "Order now and get your meal delivered in under 30 minutes anywhere in Kampala.",
      primaryButtonText: "Order Now",
      primaryButtonLink: "/menu",
      secondaryButtonText: "Contact Us",
      secondaryButtonLink: "/contact"
    },
    footer: {
      brand: "Mutindo Catering",
      tagline: "Prepared with love · Delivered with care",
      links: [
        { label: "Menu", to: "/menu" },
        { label: "About", to: "/about" },
        { label: "Catering", to: "/catering" },
        { label: "Contact", to: "/contact" }
      ]
    }
  },
  about: {
    hero: {
      eyebrow: "Kampala's Premier Catering Service",
      titleTop: "Crafting",
      titleEm: "Unforgettable",
      titleBot: "Dining Experiences",
      subtitle: "From intimate family dinners to large-scale state events — we bring passion, precision, and Ugandan heart to every single plate.",
      pills: ["Since 2020", "1,000+ Happy Clients", "500+ Events Catered"],
      ctaText: "Work With Us",
      ctaLink: "/contact",
      satisfactionBadge: "98",
      backgroundImage: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
      floatImage1: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800",
      floatImage2: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    stats: [
      { number: "500", suffix: "+", label: "Events Catered" },
      { number: "98", suffix: "%", label: "Client Satisfaction" },
      { number: "24", suffix: "h", label: "Response Time" },
      { number: "50", suffix: "+", label: "Team Members" }
    ],
    story: {
      eyebrow: "Who We Are",
      titleMain: "More Than",
      titleEm: "Just Catering",
      body1: "Mutindo Catering Services was born from one simple belief: that a great meal can change the entire mood of a moment. What began as a small family kitchen has blossomed into Kampala's most trusted name in professional catering.",
      body2: "We partner with Ugandan farmers, source the freshest local produce, and put it in the hands of our professional culinary team — chefs who cook not just with skill, but with genuine love for the craft.",
      checks: ["Locally sourced, seasonally fresh ingredients", "Custom menus for every occasion", "Professional, stress-free event management", "Full-service from prep to clean-up"],
      ctaText: "Start Planning Your Event",
      ctaLink: "/contact",
      mainImage: "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900",
      mainImageCaption: "Our Head Chef — crafting since 2020",
      accentImage: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=900",
      awardYear: "2024",
      awardTitle: "KAMPALA'S BEST CATERER"
    },
    features: {
      eyebrow: "Why Choose Us",
      titleMain: "What Makes Us",
      titleEm: "Different",
      items: [
        { tag: "Farm to Fork", title: "Locally Sourced Quality", body: "Every ingredient is hand-picked from Ugandan farms, ensuring peak freshness and supporting our local community.", image: "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { tag: "Express Service", title: "On-Time Delivery", body: "Our logistics network ensures your meals arrive piping hot and perfectly presented—every single time.", image: "https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { tag: "Culinary Craft", title: "Chef-Level Presentation", body: "Professional plating that transforms every meal into a visual masterpiece your guests will remember.", image: "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { tag: "Our People", title: "Expert Team", body: "Trained culinary professionals who treat every event with meticulous care and warm hospitality.", image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=900" }
      ]
    },
    timeline: {
      eyebrow: "Our Journey",
      titleMain: "Milestones That",
      titleEm: "Define Us",
      subtitle: "Five years of passion, one plate at a time.",
      milestones: [
        { year: "2020", title: "The Beginning", body: "Started as a family kitchen in the heart of Kampala with 3 passionate chefs.", image: "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { year: "2021", title: "First Restaurant", body: "Opened our first physical location, serving hundreds of guests daily.", image: "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800" },
        { year: "2022", title: "Catering Division", body: "Launched full-scale event catering, covering weddings, corporate, and state functions.", image: "https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900" },
        { year: "2023", title: "Award Winning", body: "Recognized as Kampala's top caterer by the Uganda Hospitality Association.", image: "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900" },
        { year: "2024", title: "Nationwide Reach", body: "Expanded our delivery and catering services across Uganda.", image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800" }
      ]
    },
    bento: {
      teamImage: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=900",
      teamTag: "The Team",
      teamTitle: "Passionate Professionals",
      teamBody: "50+ Chefs, planners & delivery crew — united by one goal.",
      menuImage: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
      menuTag: "Our Menu",
      menuTitle: "Pan-Ugandan Cuisine",
      eventsImage: "https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900",
      eventsTag: "Events",
      eventsTitle: "Any Scale, Any Occasion",
      quoteText: "Every meal we serve carries our name — so we make sure it's worth remembering.",
      quoteAuthor: "Founder, Mutindo Catering"
    },
    cta: {
      eyebrow: "Our Promise",
      titleMain: "Your Event Deserves",
      titleEm: "Nothing Less",
      titleEnd: "Than Perfect",
      subtitle: "Join thousands of satisfied clients across Uganda who trust Mutindo Catering to make every meal a defining moment.",
      badges: ["Quality Guaranteed", "Excellence Focused", "Customer First"],
      ctaText: "Book a Consultation",
      ctaLink: "/contact",
      backgroundImage: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=900"
    }
  },
  gallery: {
    title: "Our Gallery",
    subtitle: "Moments captured from our events and kitchen",
    images: [
      { id: 1, title: "Fresh Rolex Delight", description: "Our signature Ugandan rolex with fresh vegetables and eggs", imageUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=900", category: "Food", likes: 145, views: 1200, date: "2024-01-15" },
      { id: 2, title: "Matooke Feast", description: "Traditional matooke served with beef stew and groundnuts", imageUrl: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900", category: "Food", likes: 267, views: 2300, date: "2024-01-20" },
      { id: 3, title: "Elegant Wedding Setup", description: "Beautiful wedding reception with our premium catering service", imageUrl: "https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900", category: "Events", likes: 423, views: 3400, date: "2024-02-10" },
      { id: 4, title: "Grilled Chicken Platter", description: "Succulent grilled chicken with traditional Ugandan sides", imageUrl: "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=900", category: "Food", likes: 189, views: 1500, date: "2024-02-15" },
      { id: 5, title: "Corporate Event Catering", description: "Professional setup for corporate gatherings and conferences", imageUrl: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=900", category: "Events", likes: 234, views: 2100, date: "2024-02-20" },
      { id: 6, title: "Dessert Display", description: "Exquisite desserts arranged for a special occasion", imageUrl: "https://images.pexels.com/photos/1120462/pexels-photo-1120462.jpeg?auto=compress&cs=tinysrgb&w=900", category: "Food", likes: 312, views: 2800, date: "2024-02-25" }
    ]
  },
  catering: {
    hero: {
      title: "Catering Services",
      subtitle: "Make your event unforgettable with our premium catering",
      image: "https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    sectionTitle: "Catering Packages",
    ctaText: "Book Your Event Today",
    packages: [
      { id: 1, name: "Basic Package", price: 50000, guests: "10-20", description: "Perfect for intimate gatherings and small celebrations.", includes: ["2 main dishes", "1 side dish", "Soft drinks", "Basic setup"] },
      { id: 2, name: "Standard Package", price: 120000, guests: "30-50", description: "Ideal for birthday parties and family celebrations.", includes: ["3 main dishes", "2 side dishes", "Dessert", "Soft drinks", "Full setup"] },
      { id: 3, name: "Premium Package", price: 250000, guests: "70-100", description: "Complete catering experience for larger events.", includes: ["5 main dishes", "3 side dishes", "Dessert bar", "Full drinks", "Staff service", "Decorations"] },
      { id: 4, name: "Wedding Special", price: 500000, guests: "150+", description: "All-inclusive wedding catering — your perfect day, handled.", includes: ["7 main dishes", "5 side dishes", "Wedding cake", "Full bar", "Wait staff", "Decorations", "Tents & chairs"] }
    ]
  }
};

async function initAllContent() {
  console.log('🚀 Initializing all content in Firebase...');
  
  for (const [page, data] of Object.entries(defaultContent)) {
    try {
      await db.collection('content').doc(page).set(data);
      console.log(`✅ ${page} content initialized`);
    } catch (err) {
      console.error(`❌ Failed to initialize ${page}:`, err.message);
    }
  }
  
  console.log('🎉 All content initialized successfully!');
  process.exit();
}

initAllContent();