import "dotenv/config";
import { db } from "./index";
import {
  usersTable,
  formsTable,
  formFieldsTable,
  responsesTable,
  responseAnswersTable,
} from "./schema";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEMO_USER = {
  email: "demo@dexterforms.dev",
  password: "Demo@123456",
  fullName: "Demo Creator",
};

async function seed() {
  console.log("🌱 Seeding DexterForms demo data...\n");

  // ─── Demo User ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_USER.email))
    .limit(1);

  let user;
  if (existing.length > 0) {
    [user] = await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.email, DEMO_USER.email))
      .returning();
    console.log("✓ Demo user updated");
  } else {
    [user] = await db
      .insert(usersTable)
      .values({
        fullName: DEMO_USER.fullName,
        email: DEMO_USER.email,
        passwordHash,
        emailVerified: true,
      })
      .returning();
    console.log("✓ Demo user created");
  }

  if (!user) throw new Error("Failed to create demo user");

  // ─── Form 1: Stranger Things Fan Survey ────────────────────────────────
  const [form1] = await db
    .insert(formsTable)
    .values({
      creatorId: user.id,
      title: "Stranger Things Fan Survey",
      description:
        "Calling all fans of Hawkins, Indiana! Share your thoughts on the hit Netflix series Stranger Things.",
      slug: "stranger-things-fan-survey",
      status: "published",
      visibility: "public",
      themeId: "dexter",
      acceptingResponses: true,
      successMessage:
        "The Mind Flayer approves your response. Thanks for participating, Hawkins Hero! 🔦",
      responseCount: 0,
    })
    .onConflictDoUpdate({
      target: formsTable.slug,
      set: { themeId: "dexter", updatedAt: new Date() },
    })
    .returning();

  console.log("✓ Form 1: Stranger Things Fan Survey");

  // Delete existing fields so we can re-seed cleanly
  await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, form1!.id));

  const form1Fields = await db
    .insert(formFieldsTable)
    .values([
      {
        formId: form1!.id,
        type: "short_text",
        label: "Your Name (Stranger Things character?)",
        placeholder: "e.g. Eleven, Dustin, Mike...",
        required: true,
        order: 0,
      },
      {
        formId: form1!.id,
        type: "single_select",
        label: "Who is your favorite character?",
        required: true,
        order: 1,
        options: [
          { value: "eleven", label: "Eleven / Jane" },
          { value: "dustin", label: "Dustin Henderson" },
          { value: "mike", label: "Mike Wheeler" },
          { value: "lucas", label: "Lucas Sinclair" },
          { value: "will", label: "Will Byers" },
          { value: "joyce", label: "Joyce Byers" },
          { value: "jim", label: "Jim Hopper" },
          { value: "max", label: "Max Mayfield" },
        ],
      },
      {
        formId: form1!.id,
        type: "single_select",
        label: "Which monster scared you the most?",
        required: true,
        order: 2,
        options: [
          { value: "demogorgon", label: "Demogorgon" },
          { value: "mind_flayer", label: "The Mind Flayer" },
          { value: "demodogs", label: "Demo-dogs" },
          { value: "vecna", label: "Vecna (Henry Creel)" },
        ],
      },
      {
        formId: form1!.id,
        type: "rating",
        label: "Rate the overall series (1-5 stars)",
        required: true,
        order: 3,
        settings: { maxRating: 5 },
      },
      {
        formId: form1!.id,
        type: "single_select",
        label: "Would you visit Hawkins, Indiana?",
        required: false,
        order: 4,
        options: [
          { value: "yes", label: "Yes, absolutely!" },
          { value: "no", label: "No way, too dangerous" },
          { value: "maybe", label: "Maybe, if Eleven protects me" },
        ],
      },
      {
        formId: form1!.id,
        type: "long_text",
        label: "Share your favorite moment from the show",
        placeholder: "Tell us about your favorite scene or episode...",
        required: false,
        order: 5,
      },
    ])
    .returning();

  console.log(`  ↳ Added ${form1Fields.length} fields`);

  // ─── Form 2: Anime Character Survey ────────────────────────────────────
  const [form2] = await db
    .insert(formsTable)
    .values({
      creatorId: user.id,
      title: "Anime Character Alignment Quiz",
      description:
        "Find out which anime archetype you are! Answer these questions to discover your character alignment. 🌸",
      slug: "anime-character-survey",
      status: "published",
      visibility: "public",
      themeId: "dexter",
      acceptingResponses: true,
      successMessage:
        "Sugoi! Your anime alignment has been recorded. Check the results on our community board! 🌸",
      responseCount: 0,
    })
    .onConflictDoUpdate({
      target: formsTable.slug,
      set: { themeId: "dexter", updatedAt: new Date() },
    })
    .returning();

  console.log("✓ Form 2: Anime Character Alignment Quiz");

  await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, form2!.id));

  const form2Fields = await db
    .insert(formFieldsTable)
    .values([
      {
        formId: form2!.id,
        type: "short_text",
        label: "Your Anime Username",
        placeholder: "e.g. NarutoFan99, SenpaiDev...",
        required: true,
        order: 0,
      },
      {
        formId: form2!.id,
        type: "email",
        label: "Email (for result newsletter)",
        placeholder: "your@email.com",
        required: false,
        order: 1,
      },
      {
        formId: form2!.id,
        type: "single_select",
        label: "Favorite anime series?",
        required: true,
        order: 2,
        options: [
          { value: "naruto", label: "Naruto / Shippuden" },
          { value: "one_piece", label: "One Piece" },
          { value: "aot", label: "Attack on Titan" },
          { value: "death_note", label: "Death Note" },
          { value: "mha", label: "My Hero Academia" },
          { value: "demon_slayer", label: "Demon Slayer" },
          { value: "jjk", label: "Jujutsu Kaisen" },
          { value: "other", label: "Other" },
        ],
      },
      {
        formId: form2!.id,
        type: "multi_select",
        label: "Which traits describe you? (pick all that apply)",
        required: true,
        order: 3,
        options: [
          { value: "determined", label: "Determined" },
          { value: "intelligent", label: "Intelligent" },
          { value: "loyal", label: "Loyal" },
          { value: "mysterious", label: "Mysterious" },
          { value: "funny", label: "Comic relief" },
          { value: "strong", label: "Physically strong" },
        ],
      },
      {
        formId: form2!.id,
        type: "number",
        label: "Your Power Level (1-9999)",
        placeholder: "Over 9000?",
        required: true,
        order: 4,
        validations: { min: 1, max: 9999 },
      },
      {
        formId: form2!.id,
        type: "rating",
        label: "Rate this season's anime releases",
        required: true,
        order: 5,
        settings: { maxRating: 5 },
      },
      {
        formId: form2!.id,
        type: "single_select",
        label: "Team Naruto or Team Sasuke?",
        required: true,
        order: 6,
        options: [
          { value: "naruto", label: "🍜 Team Naruto (Believe it!)" },
          { value: "sasuke", label: "⚡ Team Sasuke (Darkness)" },
          { value: "sakura", label: "🌸 Team Sakura (Medic!)" },
          { value: "neutral", label: "🤝 I don't choose sides" },
        ],
      },
      {
        formId: form2!.id,
        type: "long_text",
        label: "Write your anime backstory",
        placeholder: "Every great character has an origin story. What's yours?",
        required: false,
        order: 7,
      },
    ])
    .returning();

  console.log(`  ↳ Added ${form2Fields.length} fields`);

  // ─── Form 3: Startup Pitch Validator ────────────────────────────────────
  const [form3] = await db
    .insert(formsTable)
    .values({
      creatorId: user.id,
      title: "Startup Pitch Validator",
      description:
        "Share your startup idea and get community validation. The best pitches get featured in our weekly newsletter! ⚡",
      slug: "startup-pitch-validator",
      status: "published",
      visibility: "public",
      themeId: "dexter",
      acceptingResponses: true,
      successMessage:
        "Your pitch has been logged in the matrix. Our council of VCs (very curious) will review it shortly. ⚡",
      responseCount: 0,
    })
    .onConflictDoUpdate({
      target: formsTable.slug,
      set: { themeId: "dexter", updatedAt: new Date() },
    })
    .returning();

  console.log("✓ Form 3: Startup Pitch Validator");

  await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, form3!.id));

  const form3Fields = await db
    .insert(formFieldsTable)
    .values([
      {
        formId: form3!.id,
        type: "short_text",
        label: "Startup Name",
        placeholder: "e.g. ChaiOS, DataBrew, NexaAI...",
        required: true,
        order: 0,
      },
      {
        formId: form3!.id,
        type: "email",
        label: "Founder Email",
        placeholder: "founder@startup.com",
        required: true,
        order: 1,
      },
      {
        formId: form3!.id,
        type: "short_text",
        label: "One-sentence pitch",
        placeholder: "We are Uber for cats, powered by blockchain AI...",
        required: true,
        order: 2,
      },
      {
        formId: form3!.id,
        type: "single_select",
        label: "Target Market",
        required: true,
        order: 3,
        options: [
          { value: "b2b", label: "B2B (Business to Business)" },
          { value: "b2c", label: "B2C (Business to Consumer)" },
          { value: "b2b2c", label: "B2B2C (Both)" },
          { value: "marketplace", label: "Marketplace / Platform" },
        ],
      },
      {
        formId: form3!.id,
        type: "single_select",
        label: "Current Stage",
        required: true,
        order: 4,
        options: [
          { value: "idea", label: "💡 Idea Stage" },
          { value: "prototype", label: "🔧 Prototype" },
          { value: "mvp", label: "🚀 MVP" },
          { value: "launched", label: "✅ Launched & Growing" },
          { value: "scaling", label: "📈 Scaling" },
        ],
      },
      {
        formId: form3!.id,
        type: "number",
        label: "Monthly Revenue (USD, 0 if pre-revenue)",
        placeholder: "0",
        required: true,
        order: 5,
        validations: { min: 0 },
      },
      {
        formId: form3!.id,
        type: "multi_select",
        label: "Tech Stack (pick all that apply)",
        required: false,
        order: 6,
        options: [
          { value: "react", label: "React / Next.js" },
          { value: "node", label: "Node.js" },
          { value: "python", label: "Python / FastAPI" },
          { value: "ai_ml", label: "AI / ML" },
          { value: "blockchain", label: "Blockchain / Web3" },
          { value: "mobile", label: "React Native / Flutter" },
        ],
      },
      {
        formId: form3!.id,
        type: "rating",
        label: "Rate your confidence in this idea",
        required: true,
        order: 7,
        settings: { maxRating: 5 },
      },
      {
        formId: form3!.id,
        type: "long_text",
        label: "Biggest challenge right now",
        placeholder: "What keeps you up at night? What's the hardest part?",
        required: false,
        order: 8,
      },
      {
        formId: form3!.id,
        type: "checkbox",
        label: "I agree to be featured in the DexterForms weekly newsletter",
        required: false,
        order: 9,
      },
    ])
    .returning();

  console.log(`  ↳ Added ${form3Fields.length} fields`);

  // ─── Seed Responses ──────────────────────────────────────────────────────
  // Clean up existing responses first to avoid duplicates on re-seed
  const formIds = [form1!.id, form2!.id, form3!.id];
  const existingResponses = await db
    .select({ id: responsesTable.id })
    .from(responsesTable)
    .where(inArray(responsesTable.formId, formIds));
  if (existingResponses.length > 0) {
    const responseIds = existingResponses.map((r) => r.id);
    await db.delete(responseAnswersTable).where(inArray(responseAnswersTable.responseId, responseIds));
    await db.delete(responsesTable).where(inArray(responsesTable.id, responseIds));
  }
  await seedResponses(form1!, form1Fields, form2!, form2Fields, form3!, form3Fields);

  console.log("\n✅ Seeding complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("🍵 Demo Credentials:");
  console.log(`   Email:    ${DEMO_USER.email}`);
  console.log(`   Password: ${DEMO_USER.password}`);
  console.log("\n🔗 Demo Forms:");
  console.log(`   /f/stranger-things-fan-survey`);
  console.log(`   /f/anime-character-survey`);
  console.log(`   /f/startup-pitch-validator`);
  console.log("─────────────────────────────────────────\n");
}

async function seedResponses(form1: any, form1Fields: any[], form2: any, form2Fields: any[], form3: any, form3Fields: any[]) {
  // Stranger Things responses
  const stResponses = [
    { name: "Joyce Byers Fan", email: null, answers: { 0: "JoyceFan", 1: '["joyce"]', 2: '["vecna"]', 3: "5", 4: '["maybe"]', 5: "When Eleven closes the gate in Season 2 — absolute cinema!" } },
    { name: "Dustin Fan", email: null, answers: { 0: "ChessKing", 1: '["dustin"]', 2: '["demogorgon"]', 3: "5", 4: '["yes"]', 5: "Dustin and Steve's friendship arc is peak TV writing." } },
    { name: "Eleven Forever", email: null, answers: { 0: "PsiKid", 1: '["eleven"]', 2: '["mind_flayer"]', 3: "5", 4: '["yes"]', 5: "Eggo waffles and telekinesis — the perfect combo." } },
    { name: "HopperIsAlive", email: null, answers: { 0: "HopperFan", 1: '["jim"]', 2: '["mind_flayer"]', 3: "4", 4: '["no"]', 5: "Season 3 finale had me in tears." } },
    { name: "UpsideDown Explorer", email: null, answers: { 0: "WillFan", 1: '["will"]', 2: '["demogorgon"]', 3: "5", 4: '["maybe"]', 5: "Will's journey through all seasons is the most underrated arc." } },
  ];

  for (const resp of stResponses) {
    const [response] = await db
      .insert(responsesTable)
      .values({
        formId: form1.id,
        respondentName: resp.name,
        completionTime: Math.floor(Math.random() * 120) + 60,
      })
      .returning();

    const answerEntries = Object.entries(resp.answers).map(([idx, value]) => ({
      responseId: response!.id,
      fieldId: form1Fields[parseInt(idx)]!.id,
      value,
    }));

    await db.insert(responseAnswersTable).values(answerEntries);
  }

  await db
    .update(formsTable)
    .set({ responseCount: stResponses.length })
    .where(eq(formsTable.id, form1.id));

  console.log(`✓ Seeded ${stResponses.length} Stranger Things responses`);

  // Anime responses
  const animeResponses = [
    { name: "NarutoFan99", email: "naruto@konoha.jp", answers: { 0: "NarutoFan99", 1: "naruto@konoha.jp", 2: '["naruto"]', 3: '["determined","loyal","funny"]', 4: "9000", 5: "5", 6: '["naruto"]', 7: "Raised by ramen, trained by frogs, protected by love." } },
    { name: "AttackOnWeeb", email: null, answers: { 0: "AttackOnWeeb", 1: "", 2: '["aot"]', 3: '["determined","intelligent","mysterious"]', 4: "8500", 5: "4", 6: '["sasuke"]', 7: "The coordinate ability changed everything." } },
    { name: "SenpaiDev", email: "dev@anime.io", answers: { 0: "SenpaiDev", 1: "dev@anime.io", 2: '["death_note"]', 3: '["intelligent","mysterious"]', 4: "7777", 5: "5", 6: '["sasuke"]', 7: "Light Yagami is objectively the most compelling villain-protagonist ever written." } },
    { name: "DemonSlayer42", email: null, answers: { 0: "TanjiroMain", 1: "", 2: '["demon_slayer"]', 3: '["determined","loyal","strong"]', 4: "6500", 5: "5", 6: '["naruto"]', 7: "Mugen Train arc hits different. Rengoku is the GOAT." } },
    { name: "JJKFanatic", email: "gojo@jjk.jp", answers: { 0: "GojoSatoru", 1: "gojo@jjk.jp", 2: '["jjk"]', 3: '["intelligent","mysterious","strong"]', 4: "9999", 5: "5", 6: '["neutral"]', 7: "Throughout heaven and earth, I alone am the honored one." } },
    { name: "OnePieceIsReal", email: null, answers: { 0: "LuffyD", 1: "", 2: '["one_piece"]', 3: '["determined","loyal","funny"]', 4: "8888", 5: "4", 6: '["naruto"]', 7: "I will become the Pirate King! One Piece is the longest commitment I've ever made." } },
  ];

  for (const resp of animeResponses) {
    const [response] = await db
      .insert(responsesTable)
      .values({
        formId: form2.id,
        respondentName: resp.name,
        respondentEmail: resp.email || undefined,
        completionTime: Math.floor(Math.random() * 180) + 90,
      })
      .returning();

    const answerEntries = Object.entries(resp.answers)
      .filter(([, v]) => v !== "")
      .map(([idx, value]) => ({
        responseId: response!.id,
        fieldId: form2Fields[parseInt(idx)]!.id,
        value,
      }));

    await db.insert(responseAnswersTable).values(answerEntries);
  }

  await db
    .update(formsTable)
    .set({ responseCount: animeResponses.length })
    .where(eq(formsTable.id, form2.id));

  console.log(`✓ Seeded ${animeResponses.length} Anime survey responses`);

  // Startup responses
  const startupResponses = [
    { name: "ChaiOS", email: "founder@chaios.dev", answers: { 0: "ChaiOS", 1: "founder@chaios.dev", 2: "A terminal-first OS for developers built on WebAssembly", 3: '["b2b"]', 4: '["mvp"]', 5: "2400", 6: '["react","node","ai_ml"]', 7: "5", 8: "Distribution and getting early adopters to trust a new OS", 9: "true" } },
    { name: "DataBrew", email: "cto@databrew.io", answers: { 0: "DataBrew", 1: "cto@databrew.io", 2: "Notion meets SQL for non-technical analysts", 3: '["b2b"]', 4: '["launched"]', 5: "18500", 6: '["react","python","ai_ml"]', 7: "4", 8: "Competing with established players like Airtable and Retool", 9: "false" } },
    { name: "NexaConnect", email: "hello@nexaconnect.app", answers: { 0: "NexaConnect", 1: "hello@nexaconnect.app", 2: "Uber for freelancers — instant talent marketplace", 3: '["marketplace"]', 4: '["prototype"]', 5: "0", 6: '["react","node"]', 7: "3", 8: "Chicken-and-egg marketplace problem is brutal", 9: "true" } },
    { name: "AIScribe", email: "dan@aiscribe.co", answers: { 0: "AIScribe", 1: "dan@aiscribe.co", 2: "AI that writes perfect meeting notes and extracts action items", 3: '["b2b"]', 4: '["launched"]', 5: "45000", 6: '["python","ai_ml"]', 7: "5", 8: "LLM costs are eating our margins at scale", 9: "true" } },
    { name: "GreenGrid", email: "eco@greengrid.earth", answers: { 0: "GreenGrid", 1: "eco@greengrid.earth", 2: "Carbon credit marketplace for SMBs via API", 3: '["b2b"]', 4: '["idea"]', 5: "0", 6: '["node","blockchain"]', 7: "4", 8: "Navigating carbon credit regulations across 50+ countries", 9: "false" } },
    { name: "FormGenius", email: "raj@formgenius.ai", answers: { 0: "FormGenius", 1: "raj@formgenius.ai", 2: "AI that builds perfect forms from a single sentence", 3: '["b2b2c"]', 4: '["mvp"]', 5: "1200", 6: '["react","python","ai_ml"]', 7: "5", 8: "Users don't know they need AI forms until they see it", 9: "true" } },
    { name: "MetaHire", email: "ceo@metahire.xyz", answers: { 0: "MetaHire", 1: "ceo@metahire.xyz", 2: "VR job interviews that simulate real work scenarios", 3: '["b2b"]', 4: '["prototype"]', 5: "0", 6: '["react","mobile","ai_ml"]', 7: "4", 8: "Getting enterprise HR teams to try something this novel", 9: "false" } },
  ];

  for (const resp of startupResponses) {
    const [response] = await db
      .insert(responsesTable)
      .values({
        formId: form3.id,
        respondentName: resp.name,
        respondentEmail: resp.email,
        completionTime: Math.floor(Math.random() * 300) + 120,
      })
      .returning();

    const answerEntries = Object.entries(resp.answers)
      .filter(([, v]) => v !== "" && v !== undefined)
      .map(([idx, value]) => ({
        responseId: response!.id,
        fieldId: form3Fields[parseInt(idx)]!.id,
        value,
      }));

    await db.insert(responseAnswersTable).values(answerEntries);
  }

  await db
    .update(formsTable)
    .set({ responseCount: startupResponses.length })
    .where(eq(formsTable.id, form3.id));

  console.log(`✓ Seeded ${startupResponses.length} Startup pitch responses`);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
