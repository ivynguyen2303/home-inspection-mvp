import { Request } from '@/store/localStore';

export const mockRequests: Request[] = [
  {
    id: "req_001",
    createdAt: "2024-08-20T10:30:00Z",
    status: "open",
    client: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "(415) 555-0123"
    },
    property: {
      address: "1247 Oak Street",
      cityZip: "San Francisco, CA 94117",
      type: "House",
      beds: 3,
      baths: 2,
      sqft: 2100
    },
    schedule: {
      preferredDate: "2024-08-25",
      altDate: "2024-08-26"
    },
    budget: 450,
    notes: "Looking for a thorough inspection of our 1920s Victorian home before closing. Need special attention to electrical systems, plumbing, and foundation. The house has been renovated but we want to ensure everything is up to code.",
    interestCount: 3,
    interestedInspectorIds: ["inspector_demo", "insp_003", "insp_005"]
  },
  {
    id: "req_002", 
    createdAt: "2024-08-22T14:15:00Z",
    status: "open",
    client: {
      name: "Michael Chen",
      email: "m.chen.home@email.com",
      phone: "(415) 555-0147"
    },
    property: {
      address: "890 Market Street, Unit 15B",
      cityZip: "San Francisco, CA 94102", 
      type: "Condo",
      beds: 2,
      baths: 1,
      sqft: 950
    },
    schedule: {
      preferredDate: "2024-08-24"
    },
    budget: 350,
    notes: "First-time buyer seeking inspection for a 2-bedroom condo in downtown area. Particularly concerned about HVAC system and any potential water damage issues.",
    interestCount: 2,
    interestedInspectorIds: ["inspector_demo", "insp_001"]
  },
  {
    id: "req_003",
    createdAt: "2024-08-18T09:45:00Z",
    status: "open",
    client: {
      name: "Emily Rodriguez",
      email: "emily.r.home@email.com", 
      phone: "(415) 555-0198"
    },
    property: {
      address: "456 Valencia Street",
      cityZip: "San Francisco, CA 94110",
      type: "Townhome",
      beds: 3,
      baths: 2,
      sqft: 1650
    },
    schedule: {
      preferredDate: "2024-08-26",
      altDate: "2024-08-27"
    },
    budget: 400,
    notes: "Recently purchased townhome that was listed as 'move-in ready'. Want to verify all systems are functioning properly before we move in next month.",
    interestCount: 1,
    interestedInspectorIds: ["insp_003"]
  },
  {
    id: "req_004",
    createdAt: "2024-08-19T16:20:00Z",
    status: "open",
    client: {
      name: "David Kim",
      email: "david.kim.luxury@email.com",
      phone: "(415) 555-0276"
    },
    property: {
      address: "2350 Pacific Heights",
      cityZip: "San Francisco, CA 94115",
      type: "House",
      beds: 5,
      baths: 4,
      sqft: 4200
    },
    schedule: {
      preferredDate: "2024-08-28"
    },
    budget: 650,
    notes: "Purchasing a luxury home with smart home features, wine cellar, and pool. Need inspector experienced with high-end properties and modern systems.",
    interestCount: 2,
    interestedInspectorIds: ["insp_005", "insp_001"]
  },
  {
    id: "req_005",
    createdAt: "2024-08-21T11:30:00Z",
    status: "open",
    client: {
      name: "Jennifer Taylor",
      email: "j.taylor.investor@email.com",
      phone: "(415) 555-0334"
    },
    property: {
      address: "789 Mission Street",
      cityZip: "San Francisco, CA 94103",
      type: "House",
      beds: 2,
      baths: 1,
      sqft: 1800
    },
    schedule: {
      preferredDate: "2024-08-23",
      altDate: "2024-08-24"
    },
    budget: 500,
    notes: "Looking at a property that needs work. Need detailed assessment of what repairs are needed and rough cost estimates. Property has been vacant for 2 years.",
    interestCount: 3,
    interestedInspectorIds: ["inspector_demo", "insp_003", "insp_001"]
  },
  {
    id: "req_006",
    createdAt: "2024-08-23T08:15:00Z",
    status: "open",
    client: {
      name: "Alex Martinez",
      email: "alex.martinez.first@email.com",
      phone: "(415) 555-0412"
    },
    property: {
      address: "123 Folsom Street, Unit 8A",
      cityZip: "San Francisco, CA 94107",
      type: "Condo",
      beds: 1,
      baths: 1,
      sqft: 650
    },
    schedule: {
      preferredDate: "2024-08-29"
    },
    budget: 275,
    notes: "First-time homebuyer on a tight budget. Small 1-bedroom condo but want to make sure there are no major issues before purchase.",
    interestCount: 1,
    interestedInspectorIds: ["insp_001"]
  },
  {
    id: "req_007",
    createdAt: "2024-08-17T13:45:00Z",
    status: "open",
    client: {
      name: "Robert Wilson",
      email: "r.wilson.realty@email.com",
      phone: "(415) 555-0589"
    },
    property: {
      address: "567 Hayes Street",
      cityZip: "San Francisco, CA 94102",
      type: "Townhome",
      beds: 2,
      baths: 2,
      sqft: 1350
    },
    schedule: {
      preferredDate: "2024-08-25"
    },
    budget: 380,
    notes: "Investment property purchase. Need comprehensive inspection focusing on structural integrity and major systems for rental property assessment.",
    interestCount: 0,
    interestedInspectorIds: []
  }
];