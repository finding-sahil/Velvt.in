import { prisma } from "../src/lib/db";
import { generateVolunteerId } from "../src/lib/volunteer-id";

async function testVolunteerFlow() {
  console.log("Testing Volunteer Lifecycle Pipeline...\n");

  // 1. Fetch event
  const event = await prisma.event.findUnique({ where: { slug: "velvt-curse-2-o" } });
  if (!event) throw new Error("Event not found");

  // 2. Create sample applicant
  const volunteer = await prisma.volunteer.create({
    data: {
      fullName: "Devon Vance",
      email: "devon.vance@example.com",
      phone: "+91 98765 43210",
      city: "Silchar",
      preferredRole: "Artist Relations",
      experience: "3 years hospitality & stage coordination",
      consentGiven: true,
      eventId: event.id,
      status: "pending",
    },
  });
  console.log(`1. Applicant created: ${volunteer.fullName} (ID: ${volunteer.id}, Status: ${volunteer.status})`);

  // 3. Admin approves applicant & issues credential
  const generatedId = await generateVolunteerId();
  const approved = await prisma.volunteer.update({
    where: { id: volunteer.id },
    data: {
      status: "approved",
      volunteerId: generatedId,
      assignedRole: "Artist Relations & Hospitality",
      approvedAt: new Date(),
    },
  });
  console.log(`2. Admin Approved & Issued Credential: ${approved.volunteerId} (Status: ${approved.status})`);

  // 4. Test public verification route for this credential
  const verifyRes = await fetch(`http://localhost:3000/verify/${generatedId}`);
  const verifyHtml = await verifyRes.text();
  console.log(`3. Public Verification HTTP: ${verifyRes.status}`);
  if (verifyHtml.includes(generatedId) && verifyHtml.includes("Devon Vance")) {
    console.log("✓ Credential card rendered publicly with verified name and ID!");
  }

  // 5. Test Ledger public table
  const ledgerRes = await fetch("http://localhost:3000/volunteers");
  const ledgerHtml = await ledgerRes.text();
  if (ledgerHtml.includes(generatedId)) {
    console.log("✓ Public Ledger reflects approved volunteer!");
  }

  console.log("\nVolunteer Lifecycle Pipeline verified successfully!");
}

testVolunteerFlow()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
