export interface Inspector {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsExperience: number;
  specialties: string[];
  serviceAreas: string[];
  basePrice: number;
  availability: {
    nextAvailable: string;
    responseTime: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  image: string;
  bio: string;
  certifications: string[];
  insurance: string;
  completedInspections: number;
}

export const mockInspectors: { inspectors: Inspector[] } = {
  inspectors: [
    {
      id: "inspector_demo",
      name: "Demo Inspector",
      location: "San Francisco, CA",
      rating: 4.9,
      reviewCount: 127,
      verified: true,
      yearsExperience: 8,
      specialties: ["Foundation", "Electrical", "Plumbing", "HVAC"],
      serviceAreas: ["San Francisco", "Oakland", "San Jose", "Palo Alto"],
      basePrice: 400,
      availability: {
        nextAvailable: "Tomorrow",
        responseTime: "Within 2 hours"
      },
      contact: {
        phone: "(415) 555-0987",
        email: "demo@inspectpro.com",
        website: "www.inspectpro.com"
      },
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      bio: "Certified home inspector with 8+ years of experience serving the Bay Area. Specializing in older homes and modern construction.",
      certifications: ["ASHI Certified", "InterNACHI Certified", "California Licensed"],
      insurance: "$2M General Liability",
      completedInspections: 1200
    },
    {
      id: "insp_001",
      name: "Marcus Rodriguez",
      location: "San Francisco, CA",
      rating: 4.8,
      reviewCount: 89,
      verified: true,
      yearsExperience: 6,
      specialties: ["Structural", "Electrical", "Roofing"],
      serviceAreas: ["San Francisco", "Daly City", "South Bay"],
      basePrice: 375,
      availability: {
        nextAvailable: "This week",
        responseTime: "Within 4 hours"
      },
      contact: {
        phone: "(415) 555-0234",
        email: "marcus@bayareainspect.com"
      },
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Experienced inspector with a background in construction. Known for detailed reports and excellent communication.",
      certifications: ["ASHI Member", "California Licensed"],
      insurance: "$1M Professional Liability",
      completedInspections: 850
    },
    {
      id: "insp_002",
      name: "Jennifer Chen",
      location: "Oakland, CA", 
      rating: 4.7,
      reviewCount: 156,
      verified: true,
      yearsExperience: 10,
      specialties: ["Environmental", "Mold", "Energy Efficiency"],
      serviceAreas: ["Oakland", "Berkeley", "Fremont", "San Francisco"],
      basePrice: 425,
      availability: {
        nextAvailable: "Next week",
        responseTime: "Same day"
      },
      contact: {
        phone: "(510) 555-0345",
        email: "jen@greenhomeinspect.com",
        website: "www.greenhomeinspect.com"
      },
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b9e3?w=400&h=400&fit=crop&crop=face",
      bio: "Environmental specialist focusing on healthy homes. Expert in mold detection and energy efficiency assessments.",
      certifications: ["InterNACHI Certified", "Mold Inspector Certified", "Energy Auditor"],
      insurance: "$2M Comprehensive Coverage",
      completedInspections: 1450
    },
    {
      id: "insp_003",
      name: "David Thompson",
      location: "San Jose, CA",
      rating: 4.9,
      reviewCount: 203,
      verified: true,
      yearsExperience: 12,
      specialties: ["Commercial", "Luxury Homes", "Pool & Spa"],
      serviceAreas: ["San Jose", "Santa Clara", "Sunnyvale", "Palo Alto"],
      basePrice: 450,
      availability: {
        nextAvailable: "This week",
        responseTime: "Within 1 hour"
      },
      contact: {
        phone: "(408) 555-0456",
        email: "david@premiumhomeinspect.com",
        website: "www.premiumhomeinspect.com"
      },
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Premium inspector specializing in luxury properties and commercial buildings. Known for comprehensive reports.",
      certifications: ["Master Inspector", "Pool/Spa Inspector", "Commercial Certified"],
      insurance: "$5M Commercial Coverage",
      completedInspections: 2100
    },
    {
      id: "insp_004",
      name: "Lisa Park",
      location: "Palo Alto, CA",
      rating: 4.6,
      reviewCount: 74,
      verified: true,
      yearsExperience: 5,
      specialties: ["New Construction", "Technology Systems", "Smart Homes"],
      serviceAreas: ["Palo Alto", "Mountain View", "Menlo Park", "San Francisco"],
      basePrice: 390,
      availability: {
        nextAvailable: "Tomorrow",
        responseTime: "Within 3 hours"
      },
      contact: {
        phone: "(650) 555-0567",
        email: "lisa@techhomeinspect.com"
      },
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Technology-focused inspector specializing in smart home systems and new construction in Silicon Valley.",
      certifications: ["InterNACHI Certified", "Smart Home Specialist"],
      insurance: "$1.5M Professional Liability",
      completedInspections: 620
    },
    {
      id: "insp_005",
      name: "Robert Kim",
      location: "San Francisco, CA",
      rating: 4.8,
      reviewCount: 134,
      verified: true,
      yearsExperience: 9,
      specialties: ["Historic Homes", "Seismic Safety", "Foundation"],
      serviceAreas: ["San Francisco", "Marin County", "Oakland"],
      basePrice: 475,
      availability: {
        nextAvailable: "Next week",
        responseTime: "Within 2 hours"
      },
      contact: {
        phone: "(415) 555-0678",
        email: "robert@heritageinspect.com",
        website: "www.heritageinspect.com"
      },
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      bio: "Specialist in historic and vintage homes. Expert in seismic retrofitting and foundation assessments.",
      certifications: ["ASHI Certified", "Seismic Safety Inspector", "Historic Preservation"],
      insurance: "$3M Specialty Coverage",
      completedInspections: 1100
    }
  ]
};