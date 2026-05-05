const { db } = require('../config/firebase');

const aboutData = {
  "hero": {
    "eyebrow": "Kampala's Premier Catering Service",
    "titleTop": "Crafting",
    "titleEm": "Unforgettable",
    "titleBot": "Dining Experiences",
    "subtitle": "From intimate family dinners to large-scale state events — we bring passion, precision, and Ugandan heart to every single plate.",
    "pills": ["Since 2020", "1,000+ Happy Clients", "500+ Events Catered"],
    "ctaText": "Work With Us",
    "ctaLink": "/contact",
    "satisfactionBadge": "98",
    "backgroundImage": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "floatImage1": "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800",
    "floatImage2": "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  "stats": [
    { "number": "500", "suffix": "+", "label": "Events Catered" },
    { "number": "98", "suffix": "%", "label": "Client Satisfaction" },
    { "number": "24", "suffix": "h", "label": "Response Time" },
    { "number": "50", "suffix": "+", "label": "Team Members" }
  ],
  "story": {
    "eyebrow": "Who We Are",
    "titleMain": "More Than",
    "titleEm": "Just Catering",
    "body1": "Mutindo Catering Services was born from one simple belief: that a great meal can change the entire mood of a moment. What began as a small family kitchen has blossomed into Kampala's most trusted name in professional catering.",
    "body2": "We partner with Ugandan farmers, source the freshest local produce, and put it in the hands of our professional culinary team — chefs who cook not just with skill, but with genuine love for the craft.",
    "checks": [
      "Locally sourced, seasonally fresh ingredients",
      "Custom menus for every occasion",
      "Professional, stress-free event management",
      "Full-service from prep to clean-up"
    ],
    "ctaText": "Start Planning Your Event",
    "ctaLink": "/contact",
    "mainImage": "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900",
    "mainImageCaption": "Our Head Chef — crafting since 2020",
    "accentImage": "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=900",
    "awardYear": "2024",
    "awardTitle": "KAMPALA'S BEST CATERER"
  },
  "features": {
    "eyebrow": "Why Choose Us",
    "titleMain": "What Makes Us",
    "titleEm": "Different",
    "items": [
      {
        "tag": "Farm to Fork",
        "title": "Locally Sourced Quality",
        "body": "Every ingredient is hand-picked from Ugandan farms, ensuring peak freshness and supporting our local community.",
        "image": "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "tag": "Express Service",
        "title": "On-Time Delivery",
        "body": "Our logistics network ensures your meals arrive piping hot and perfectly presented—every single time.",
        "image": "https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "tag": "Culinary Craft",
        "title": "Chef-Level Presentation",
        "body": "Professional plating that transforms every meal into a visual masterpiece your guests will remember.",
        "image": "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "tag": "Our People",
        "title": "Expert Team",
        "body": "Trained culinary professionals who treat every event with meticulous care and warm hospitality.",
        "image": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=900"
      }
    ]
  },
  "timeline": {
    "eyebrow": "Our Journey",
    "titleMain": "Milestones That",
    "titleEm": "Define Us",
    "subtitle": "Five years of passion, one plate at a time.",
    "milestones": [
      {
        "year": "2020",
        "title": "The Beginning",
        "body": "Started as a family kitchen in the heart of Kampala with 3 passionate chefs.",
        "image": "https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "year": "2021",
        "title": "First Restaurant",
        "body": "Opened our first physical location, serving hundreds of guests daily.",
        "image": "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800"
      },
      {
        "year": "2022",
        "title": "Catering Division",
        "body": "Launched full-scale event catering, covering weddings, corporate, and state functions.",
        "image": "https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900"
      },
      {
        "year": "2023",
        "title": "Award Winning",
        "body": "Recognized as Kampala's top caterer by the Uganda Hospitality Association.",
        "image": "https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=900"
      },
      {
        "year": "2024",
        "title": "Nationwide Reach",
        "body": "Expanded our delivery and catering services across Uganda.",
        "image": "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800"
      }
    ]
  },
  "bento": {
    "teamImage": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=900",
    "teamTag": "The Team",
    "teamTitle": "Passionate Professionals",
    "teamBody": "50+ Chefs, planners & delivery crew — united by one goal.",
    "menuImage": "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
    "menuTag": "Our Menu",
    "menuTitle": "Pan-Ugandan Cuisine",
    "eventsImage": "https://images.pexels.com/photos/1414235/pexels-photo-1414235.jpeg?auto=compress&cs=tinysrgb&w=900",
    "eventsTag": "Events",
    "eventsTitle": "Any Scale, Any Occasion",
    "quoteText": "Every meal we serve carries our name — so we make sure it's worth remembering.",
    "quoteAuthor": "Founder, Mutindo Catering"
  },
  "cta": {
    "eyebrow": "Our Promise",
    "titleMain": "Your Event Deserves",
    "titleEm": "Nothing Less",
    "titleEnd": "Than Perfect",
    "subtitle": "Join thousands of satisfied clients across Uganda who trust Mutindo Catering to make every meal a defining moment.",
    "badges": ["Quality Guaranteed", "Excellence Focused", "Customer First"],
    "ctaText": "Book a Consultation",
    "ctaLink": "/contact",
    "backgroundImage": "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=900"
  }
};

async function initAbout() {
  try {
    await db.collection('content').doc('about').set(aboutData);
    console.log('✅ About page content initialized in Firebase');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit();
  }
}

initAbout();