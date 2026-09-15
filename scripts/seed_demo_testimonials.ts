import { prisma } from "../src/lib/db";

const DEMO_TESTIMONIALS = [
  {
    quote: "VELVT has redefined nocturnal live culture in Assam. The acoustic depth and gothic discipline were unlike anything the region has ever seen.",
    authorName: "Ananya Roy",
    authorRole: "VIP Attendee & Culture Writer",
    company: "Nocturne Chronicles",
    category: "attendee",
    rating: 5,
    displayOrder: 2,
    isApproved: true,
    isFeatured: true,
  },
  {
    quote: "Partnering as a hospitality sponsor gave our brand unmatched cultural prestige among high-value creative audiences. Flawless gate execution.",
    authorName: "Vikram Sengupta",
    authorRole: "Managing Director",
    company: "Elysian Hospitality",
    category: "sponsor",
    rating: 5,
    displayOrder: 3,
    isApproved: true,
    isFeatured: true,
  },
  {
    quote: "Operating the lighting and stage arrays behind CURSE was an adrenaline rush. The cryptographic crew credentials and production discipline are top tier.",
    authorName: "Debojit Paul",
    authorRole: "Stage Operations Crew Lead",
    company: "VELVT Production",
    category: "volunteer",
    rating: 5,
    displayOrder: 4,
    isApproved: true,
    isFeatured: true,
  },
  {
    quote: "A masterclass in spatial curation, dark elegance, and crowd control. When the crimson lights dropped, the room turned into pure theater.",
    authorName: "Meenakshi Das",
    authorRole: "Creative Director",
    company: "Prism Collective",
    category: "attendee",
    rating: 5,
    displayOrder: 5,
    isApproved: true,
    isFeatured: true,
  },
  {
    quote: "As official beverage partners, our integration was executed with unmatched aesthetic subtlety. Every detail feels strictly intentional.",
    authorName: "Rohit Bhattacharjee",
    authorRole: "Brand Partnerships Head",
    company: "Velvet Spirit Co.",
    category: "sponsor",
    rating: 5,
    displayOrder: 6,
    isApproved: true,
    isFeatured: true,
  },
  {
    quote: "Being part of the gate and wristband verification crew taught me more about real-time production logistics than any classroom ever could.",
    authorName: "Sneha Choudhury",
    authorRole: "Operations Volunteer",
    company: "VELVT Crew '25",
    category: "volunteer",
    rating: 5,
    displayOrder: 7,
    isApproved: true,
    isFeatured: true,
  },
];

async function main() {
  console.log("Seeding demo testimonials into database...");
  for (const item of DEMO_TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: item.authorName },
    });

    if (!existing) {
      const created = await prisma.testimonial.create({
        data: item,
      });
      console.log(`✓ Inserted testimonial for: ${item.authorName} (${created.id})`);
    } else {
      console.log(`- Already exists: ${item.authorName}`);
    }
  }
}

main()
  .then(() => {
    console.log("Testimonials seeding complete.");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Error seeding testimonials:", e);
    return prisma.$disconnect();
  });
